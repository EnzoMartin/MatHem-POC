const config = require('./config');
const Models = require('./models');
const async = require('async');

const { getProductDetail, getProductList, getSidebarLinks } = require('./modules/scraper');

const { logger, redis, db } = config;
const types = ['badges', 'categories', 'manufacturer', 'origins', 'tags'];

const mapTypes = types.map((item) => {
  return `${item.substr(0, 1).toUpperCase()}${item.substr(1)}Map`;
});

// getSidebarLinks();
// getProductList();
// getProductDetail();

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
      const keys = [];
      const updateStatement = [];

      // Use first model in array to get keys
      Object.keys(items[0]).forEach((item) => {
        keys.push(`\`${item}\``);
        updateStatement.push(`${item}=VALUES(${item})`);
      });

      const { values, mapping } = items.reduce((data, item) => {
        // Push values of map definitions
        data.values.push(Object.values(item));

        // Push product to target map relation
        data.mapping.push(Object.values(new MapModel(product, item)));
        return data;
      }, { values: [], mapping: [] });

      mappings[type] = {
        values,
        keys: keys.join(','),
        updateStatement: updateStatement.join(','),
        mapping
      };
    }

    return mappings;
  }, {});
}

/**
 * Bulk insert the product to definition mapping rows
 * @param {String} tableName
 * @param {Array} values
 * @param {Function} callback
 * @returns {*}
 */
function queryInsertMapping(tableName, values, callback){
  return db.query(`INSERT INTO ${tableName} (id,product,target) VALUES ?`, [values], callback);
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
 * @param {Object} mappings
 */
function insertMappings(product, mappings){
  types.forEach((type) => {
    const mappingTable = `${type}_map`;
    const mappingType = mappings[type];

    // Clear out the existing product <-> definition mapping first
    const deleteMappings = queryDeleteMappings(product, mappingTable, (err) => {
      if(err){
        logger.error({err,query:deleteMappings.sql},`Failed to delete ${type} mappings for ${product.url}`);
      } else if(mappingType && mappingType.values.length){
        // Add the updated definitions
        const insertDefinitions = db.query(`INSERT INTO ${type} (${mappingType.keys}) VALUES ? ON DUPLICATE KEY UPDATE ${mappingType.updateStatement}`, [mappingType.values], (err) => {
          if(err){
            logger.error({ err, query: insertDefinitions.sql }, `Failed to insert ${type} map definition`);
          } else {
            const insertMappings = queryInsertMapping(mappingTable, mappingType.mapping, (err) => {
              if(err){
                logger.error({ err, query: insertMappings.sql }, `Failed to insert ${type} mappings for ${product.url}`);
              }
            });
          }
        });
      }
    });
  });
}

function scanInitial(){
  logger.info('Starting scrape');
  getSidebarLinks(config.rootUrl).then((data) => {
    const { menu } = data;

    const items = menu.reduce((items, item) => {
      if(item.url){
        items[item.url] = false;
      }
      return items;
    }, {});

    redis.hmset('urls.crawled', items);

    Object.keys(items).forEach((key) => {

    });
    console.log(items);
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

    const categories = data.categories.reduce((items, item) => {
      if(item.url !== '/'){
        const category = new Models.Category(item);

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

    // console.log('product', product);
    // console.log('categories', categories);
    // console.log('badges', badges);
    // console.log('crawl', toCrawl);

    const insertItem = db.query('INSERT INTO products SET ? ON DUPLICATE KEY UPDATE ?', [product, product], (err) => {
      if(err){
        logger.error({ err, query: insertItem.sql }, `Failed to insert product ${product.name}`);
      }
    });

    const deleteMappings = queryDeleteMappings(product, 'similar_map', (err) => {
      if(err){
        logger.error({err,query:deleteMappings.sql},`Failed to delete similar items mappings for ${product.url}`);
      } else {
        const insertMappings = queryInsertMapping('similar_map', similarProducts, (err) => {
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

// Do it
// scanInitial();

scanProduct('/varor/banan/banan-eko-klass1');
scanProduct('/varor/saffran/saffran-0-5g-kockens');
scanProduct('/varor/valnotter/valnotter-med-skal-jumbo-eko-500g-klass1');
