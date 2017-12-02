const async = require('async');

const config = require('../config');
const Models = require('../models');

const { getProductDetail } = require('./scraper');
const { logger, redis, db } = config;

const types = ['badges', 'categories', 'manufacturer', 'origins', 'tags'];

const mapTypes = types.map((item) => {
  return `${item.substr(0, 1).toUpperCase()}${item.substr(1)}Map`;
});

/**
 * Generate mapping object of every mapping type
 * @param {Object} product
 * @param {Object} data
 * @returns {Object}
 */
function generateMappings(product, data){
  return types.reduce((mappings, type, index) => {
    const items = data[type];

    if(items.length){
      const MapModel = Models[mapTypes[index]];
      const definitionKeys = [];
      const updateStatement = [];

      // Use first model in array to get keys
      Object.keys(items[0]).forEach((item) => {
        definitionKeys.push(`\`${item}\``);
        updateStatement.push(`${item}=VALUES(${item})`);
      });

      const { definitionValues, mappingValues } = items.reduce((data, item) => {
        // Push values of map definitions
        data.definitionValues.push(Object.values(item));

        // Push product to target map relation
        data.mappingValues.push(Object.values(new MapModel(product, item)));
        return data;
      }, { definitionValues: [], mappingValues: [] });

      mappings[type] = {
        definitions: {
          values: definitionValues,
          keys: definitionKeys.join(','),
          updateStatement: updateStatement.join(',')
        },
        mappings: {
          values: mappingValues,
          keys: MapModel.keys().join(',')
        }
      };
    }

    return mappings;
  }, {});
}

/**
 * Bulk insert the product to definition mapping rows
 * @param {String} tableName
 * @param {String} keys
 * @param {Array} values
 * @param {Function} callback
 * @returns {*}
 */
function queryInsertMapping(tableName, keys, values, callback){
  return db.query(`INSERT INTO ${tableName} (${keys}) VALUES ?`, [values], callback);
}

/**
 * Delete existing mappings
 * @param {Object} product
 * @param {String} tableName
 * @param {Function} callback
 * @returns {*}
 */
function queryDeleteMappings(product, tableName, callback){
  return db.query(`DELETE FROM ${tableName} WHERE product = ?`, product.url, callback);
}

/**
 * Insert all the mapping information
 * @param {Object} product
 * @param {Object} allMappings
 * @param {Function} callback
 */
function insertMappings(product, allMappings, callback){
  const tasks = types.map((type) => {
    return (callback) => {
      const mappingTable = `${type}_map`;
      const data = allMappings[type] || {};
      const { definitions, mappings } = data;

      function insertMappings(){
        const insertMappings = queryInsertMapping(mappingTable, mappings.keys, mappings.values, (err) => {
          if(err){
            logger.error({ err, query: insertMappings.sql }, `Failed to insert ${type} mappings for ${product.url}`);
          }
          callback(err);
        });
      }

      // Clear out the existing product <-> definition mapping first
      const deleteMappings = queryDeleteMappings(product, mappingTable, (err) => {
        if(err){
          logger.error({err,query:deleteMappings.sql},`Failed to delete ${type} mappings for ${product.url}`);
          callback(err);
        } else if(definitions && definitions.values.length){
          // Add the updated definitions
          if(type !== 'categories'){
            const insertDefinitions = db.query(`INSERT INTO ${type} (${definitions.keys}) VALUES ? ON DUPLICATE KEY UPDATE ${definitions.updateStatement}`, [definitions.values], (err) => {
              if(err){
                logger.error({ err, query: insertDefinitions.sql }, `Failed to insert ${type} map definition`);
                callback(err);
              } else {
                insertMappings();
              }
            });
          } else {
            // Category definitions are updated by the categories scraper
            insertMappings();
          }
        } else {
          callback();
        }
      });
    };
  });

  async.parallel(tasks, callback);
}


/**
 * Scan a given product
 * @param {String} fragment
 * @param {Function} callback
 */
function scanProduct(fragment, callback){
  const url = `${config.rootUrl}${fragment}`;

  getProductDetail(url).then((data) => {
    const item = data.item[0];

    // Some items are unparseable apparently
    if(!item){
      redis.sadd('items.unparseable', fragment, () => {
        callback();
      });
    } else {
      const product = new Models.Item({
        ...data.item[0],
        url: fragment
      });

      const origins = item.origin ? [new Models.Origin({ name: item.origin })] : [];
      const manufacturer = item.manufacturerUrl ? [new Models.Manufacturer({
        name: item.manufacturer,
        url: item.manufacturerUrl
      })] : [];

      const categories = data.categories.map((item) => {
        return new Models.Category(item);
      });

      const {badges, tags} = data.badges.reduce((data, item) => {
        data.badges.push(new Models.Badge(item));

        data.tags.push(new Models.Tag(item));
        return data;
      }, {badges:[],tags:[]});

      const mappings = generateMappings(product, {
        badges,
        categories,
        origins,
        manufacturer,
        tags
      });

      const similarProducts = data.similar.map((item) => {
        return Object.values(new Models.SimilarMap(product,item));
      });

      const tasks = {
        insertItem: (callback) => {
          const insertItem = db.query('INSERT INTO products SET ? ON DUPLICATE KEY UPDATE ?', [product, product], (err) => {
            if(err){
              logger.error({ err, query: insertItem.sql }, `Failed to insert product ${product.name}`);
            }
            callback(err);
          });
        },
        similarItems: (callback) => {
          const deleteMappings = queryDeleteMappings(product, 'similar_map', (err) => {
            if(err){
              logger.error({err,query:deleteMappings.sql},`Failed to delete similar items mappings for ${product.url}`);
              callback(err);
            } else if(similarProducts.length){
              const insertMappings = queryInsertMapping('similar_map', Models.SimilarMap.keys().join(','), similarProducts, (err) => {
                if(err){
                  logger.error({ err, query: insertMappings.sql }, `Failed to insert similar products mappings for ${product.url}`);
                }
                callback(err);
              });
            } else {
              callback(null);
            }
          });
        },
        markCrawled: (callback) => {
          return redis.sadd('items.crawled', product.url, callback);
        },
        insertMappings: (callback) => {
          insertMappings(product, mappings, callback);
        }
      };

      async.parallel(tasks, (err) => {
        if(!err){
          logger.info({ item: product }, 'Finished crawling item');
        }
        callback(err);
      });
    }
  }).catch((err) => {
    logger.error({ err, item: { url: fragment } }, 'Failed to fetch product');
    callback(err);
  });
}

module.exports = scanProduct;
