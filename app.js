const config = require('./config');
const Models = require('./models');
const scraper = require('scrape-it');
const async = require('async');

const { getProductDetail, getProductList, getSidebarLinks } = require('./modules/scraper');

const { logger, redis, db } = config;


// getSidebarLinks();
// getProductList();
// getProductDetail();

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

function scanProduct(fragment){
  const url = `${config.rootUrl}${fragment}`;

  getProductDetail(url).then((data) => {
    const item = data.item[0];
    const toCrawl = [];
    const categoryMap = [];
    const originMap = [];
    const manufacturerMap = [];
    const tagMap = [];
    const badgeMap = [];
    const categories = [];

    const product = new Models.Item({
      ...data.item[0],
      url: fragment
    });

    const origin = new Models.Origin({ name: item.origin });
    const manufacturer = new Models.Manufacturer({
      name: item.manufacturer,
      url: item.manufacturerUrl
    });

    data.categories.forEach((item) => {
      if(item.url !== '/'){
        const category = new Models.Category(item);

        categories.push(category);

        // Add to crawler
        toCrawl.push({ [category.url]: false});
      }
    });

    const categoryKeys = [];
    const categoryUpdates = [];

    Object.keys(categories[0]).forEach((item) => {
      categoryKeys.push(`\`${item}\``);
      categoryUpdates.push(`${item}=VALUES(${item})`);
    });

    const categoryValues = categories.map((item) => {
      return Object.values(item);
    });

    console.log('product', product);
    console.log('categories', categories);
    console.log('crawl', toCrawl);

    const insertItem = db.query('INSERT INTO products SET ? ON DUPLICATE KEY UPDATE ?', [product, product], (err) => {
      if(err){
        logger.error({ err, query: insertItem.sql }, `Failed to insert product ${product.name}`);
      }
    });

    const insertCategories = db.query(`INSERT INTO categories (${categoryKeys.join(',')}) VALUES ? ON DUPLICATE KEY UPDATE ${categoryUpdates.join(',')}`, [categoryValues], (err) => {
      if(err){
        logger.error({ err, query: insertCategories.sql }, 'Failed to insert categories');
      }
    });
  });
}

// Do it
// scanInitial();

scanProduct('/varor/banan/banan-eko-klass1');
