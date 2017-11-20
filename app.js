const Promise = require('bluebird');
Promise.promisifyAll(require('scrape-it'));

const scraper = require('scrape-it');
const bunyan = require('bunyan');

const pjson = require('./package.json');

const logger = bunyan.createLogger({
  name:pjson.name,
  serializers: {
    err: bunyan.stdSerializers.err
  }
});

function getSidebarLinks(){
  scraper('https://www.mathem.se/', {
    menu: {
      listItem: 'ul.navigation li',
      name: 'links',
      data: {
        title: 'a',
        url: {
          selector: 'a',
          attr: 'href'
        }
      }
    }
  }).then((item) => {
    logger.info(item);
  });
}

function getProductList(){
  scraper('https://www.mathem.se/varor/frukt-o-gront', {
    items: {
      listItem: '#productResultContainer .product',
      name: 'item',
      data: {
        title: '.prodHeader',
        url: {
          selector: '.prodImg a',
          attr: 'href'
        },
        offer: '.prodImg .offerBubble',
        limitations: '.prodImg .deliveryDays',
        badges: {
          selector: '.prodImg .productBadges img',
          attr: 'src'
        },
        image: {
          selector: '.prodImg a > img',
          attr: 'src'
        },
        origin: '.origin',
        priceOriginal: '.priceOrd',
        priceReduced: '.red > span',
        priceType: '.red > font',
        priceKg: '.priceKg > span'
      }
    }
  }).then((item) => {
    logger.info(item);
  });
}

function getProductDetail(){
  scraper('https://www.mathem.se/varor/applen/apple-granny-smith-klass1', {
    item: {
      listItem: '.productPage',
      name: 'product',
      data: {
        title: 'h1',
        content: {
          selector: '.productInfo',
          how: 'html'
        },
        origin: {
          selector: '.productInfo > p',
          how: 'html',
          convert: (item) => {
            return item.includes('Ursprung') ? item.replace('<strong>Ursprung:</strong>', '').trim() : '';
          }
        },
        manufacturer: '.productInfo p > a',
        manufacturerUrl: {
          selector: '.productInfo p > a',
          attr: 'href'
        }
      }
    },
    categories: {
      listItem: '.breadcrumbNav > ul li',
      name: 'categories',
      data: {
        title: 'a span',
        url: {
          selector: 'a',
          attr: 'href'
        }
      }
    }
  }).then((item) => {
    logger.info(item);
  })
}

// getSidebarLinks();
// getProductList();
// getProductDetail();
