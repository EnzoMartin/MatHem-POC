const config = require('./config');
const Models = require('./models');
const async = require('async');

const { getProductDetail, getProductList, getSidebarLinks } = require('./modules/scraper');

const scanProduct = require('./modules/product');

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


// Do it
// scanInitial();

scanProduct('/varor/banan/banan-eko-klass1');
scanProduct('/varor/saffran/saffran-0-5g-kockens');
scanProduct('/varor/valnotter/valnotter-med-skal-jumbo-eko-500g-klass1');
