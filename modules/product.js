const config = require('../config');
const Models = require('../models');

const { getProductDetail } = require('./scraper');

const { logger, db } = config;

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
          updateStatement: updateStatement.join(','),
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
 */
function insertMappings(product, allMappings){
  types.forEach((type) => {
    const mappingTable = `${type}_map`;
    const data = allMappings[type] || {};
    const { definitions, mappings } = data;

    function insertMappings(){
      const insertMappings = queryInsertMapping(mappingTable, mappings.keys, mappings.values, (err) => {
        if(err){
          logger.error({ err, query: insertMappings.sql }, `Failed to insert ${type} mappings for ${product.url}`);
        }
      });
    }

    // Clear out the existing product <-> definition mapping first
    const deleteMappings = queryDeleteMappings(product, mappingTable, (err) => {
      if(err){
        logger.error({err,query:deleteMappings.sql},`Failed to delete ${type} mappings for ${product.url}`);
      } else if(definitions && definitions.values.length){
        // Add the updated definitions
        if(type !== 'categories'){
          const insertDefinitions = db.query(`INSERT INTO ${type} (${definitions.keys}) VALUES ? ON DUPLICATE KEY UPDATE ${definitions.updateStatement}`, [definitions.values], (err) => {
            if(err){
              logger.error({ err, query: insertDefinitions.sql }, `Failed to insert ${type} map definition`);
            } else {
              insertMappings();
            }
          });
        } else {
          // Category definitions are updated by the categories scraper
          insertMappings();
        }
      }
    });
  });
}


/**
 * Scan a given product
 * @param {String} fragment
 */
function scanProduct(fragment){
  const url = `${config.rootUrl}${fragment}`;

  getProductDetail(url).then((data) => {
    const item = data.item[0];
    const toCrawl = [];

    const product = new Models.Item({
      ...data.item[0],
      url: fragment
    });

    const origins = item.origin ? [new Models.Origin({ name: item.origin })] : [];
    const manufacturer = item.manufacturerUrl ? [new Models.Manufacturer({
      name: item.manufacturer,
      url: item.manufacturerUrl
    })] : [];

    const categories = data.categories.reduce((items, item, index) => {
      if(item.url !== '/'){
        const category = new Models.Category({
          ...item,
          parent: (data.categories[index - 1] || {}).url
        });

        items.push(category);

        // Add to crawler
        toCrawl.push({ [category.url]: false});
      }
      return items;
    }, []);

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

    const insertItem = db.query('INSERT INTO products SET ? ON DUPLICATE KEY UPDATE ?', [product, product], (err) => {
      if(err){
        logger.error({ err, query: insertItem.sql }, `Failed to insert product ${product.name}`);
      }
    });

    const deleteMappings = queryDeleteMappings(product, 'similar_map', (err) => {
      if(err){
        logger.error({err,query:deleteMappings.sql},`Failed to delete similar items mappings for ${product.url}`);
      } else {
        const insertMappings = queryInsertMapping('similar_map', Models.SimilarMap.keys().join(','), similarProducts, (err) => {
          if(err){
            logger.error({ err, query: insertMappings.sql }, `Failed to insert similar products mappings for ${product.url}`);
          }
        });
      }
    });

    insertMappings(product, mappings);
  }).catch((err) => {
    logger.error({ err, fragment }, 'Failed to fetch product');
  });
}

module.exports = scanProduct;
