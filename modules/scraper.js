const scraper = require('scrape-it');
const { convertToDecimal } = require('./utils');

function getSidebarLinks(url){
  return scraper(url, {
    menu: {
      listItem: 'ul.navigation li',
      name: 'link',
      data: {
        name: 'a',
        url: {
          selector: 'a',
          attr: 'href'
        }
      }
    }
  });
}

function getProductList(url){
  return scraper(url, {
    items: {
      listItem: '#productResultContainer .product',
      name: 'item',
      data: {
        name: '.prodHeader',
        url: {
          selector: '.prodImg a',
          attr: 'href'
        }
      }
    },
    subcategories: {
      listItem: 'ul.navigation li.selected ul > li',
      name: 'subcategory',
      data: {
        name: 'a',
        url: {
          selector: 'a',
          attr: 'href'
        }
      }
    },
    bottomcategories: {
      listItem: 'ul.navigation li.selected ul > li.selected > ul > li',
      name: 'bottomcategory',
      data: {
        name: 'a',
        url: {
          selector: 'a',
          attr: 'href'
        }
      }
    }
  });
}

function getProductDetail(url){
  return scraper(url, {
    item: {
      listItem: '.productPage',
      name: 'product',
      data: {
        name: 'h1',
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
        manufacturer: {
          selector: '.productInfo p > a',
          how: 'html',
          convert: (item) => {
            return item ? item.replace('varor fr&#xE5;n', '').trim() : '';
          }
        },
        manufacturerUrl: {
          selector: '.productInfo p > a',
          attr: 'href'
        },
        offer: '.prodImg .offerBubble',
        limitations: '.prodImg .deliveryDays',
        image: {
          selector: '.prodImg #productImage',
          attr: 'src'
        },
        priceOriginal: {
          selector: '.productPrice .priceOrd s',
          how: 'html',
          convert: (item) => {
            return item ? convertToDecimal(item.replace('Ord.pris','')) : 0;
          }
        },
        priceReduced: {
          selector: '.productPrice .red #spnPrice',
          how: 'html',
          convert: (item) => {
            return convertToDecimal(item);
          }
        },
        priceType: {
          selector: '.productPrice .priceKg > span',
          how: 'html',
          convert: (item) => {
            return item.split('/')[1].trim();
          }
        },
        priceUnit: {
          selector: '.productPrice .priceKg > span',
          how: 'html',
          convert: (item) => {
            return convertToDecimal(item.split('/')[0].replace('ca', ''));
          }
        }
      }
    },
    badges: {
      listItem: '.prodImg .productBadges',
      name: 'badge',
      data: {
        name: {
          selector: 'img',
          attr: 'data-original-title'
        },
        url: {
          selector: 'img',
          attr: 'src'
        },
        text: {
          selector: 'img',
          attr: 'alt'
        }
      }
    },
    categories: {
      listItem: '.breadcrumbNav > ul li',
      name: 'category',
      data: {
        name: 'a span',
        url: {
          selector: 'a',
          attr: 'href'
        }
      }
    },
    similar: {
      listItem: '.similarProducts ul > li .prodHeader',
      name: 'similar',
      data: {
        name: 'a',
        url: {
          selector: 'a',
          attr: 'href'
        }
      }
    }
  });
}

module.exports = {
  getSidebarLinks,
  getProductList,
  getProductDetail
};
