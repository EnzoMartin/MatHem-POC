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
    name: '.productContainer .myPageTopContainer h1',
    title: '#productResultContainer > .product.textBox h3',
    description: {
      selector: '#productResultContainer > .product.textBox',
      how: 'text',
      convert: (item) => {
        return item ? item.split('\n')[1].trim() : '';
      }
    },
    more: {
      selector: '#callbackUrl',
      attr: 'href'
    },
    total: {
      selector: '#totalProductsFound',
      attr: 'value'
    },
    url: {
      selector: '.breadcrumbNav li:last-of-type a',
      attr: 'href'
    },
    parent: {
      selector: '.breadcrumbNav li:nth-last-child(2) a',
      attr: 'href'
    },
    items: {
      listItem: '#productResultContainer > .product.prod-info',
      name: 'item',
      data: {
        name: '.prodHeader',
        url: {
          selector: '.prodImg a',
          attr: 'href'
        }
      }
    },
    categories: {
      listItem: 'ul.navigation li.selected ul > li:not(.selected)',
      name: 'category',
      data: {
        name: 'a',
        url: {
          selector: 'a',
          attr: 'href'
        }
      }
    },
    subcategories: {
      listItem: 'ul.navigation li.selected ul > li.selected > ul > li:not(.selected)',
      name: 'subcategory',
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

function getMoreProductList(url){
  return scraper(url, {
    items: {
      listItem: '.product.prod-info',
      name: 'item',
      data: {
        name: '.prodHeader',
        url: {
          selector: '.prodImg a',
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
            let converted = '';
            if(item){
              item = item.split('\r')[0];
              converted = item.startsWith('Ursprung') ? item.replace('<strong>Ursprung:</strong>', '').trim() : '';
            }
            return converted;
          }
        },
        manufacturer: {
          selector: '.productInfo p > a',
          how: 'html',
          convert: (item) => {
            let converted = '';
            if(item){
              // HTML keeps sneaking in
              item = item.replace('<span class="red">', '').replace('</span>', '');
              converted = item.replace('varor fr&#xE5;n', '').trim();
            }
            return converted;
          }
        },
        manufacturerUrl: {
          selector: '.productInfo p > a',
          attr: 'href'
        },
        offer: {
          selector: '.prodImg .offerAndDelivery .offerBubble',
          how: 'html',
          convert: (item) => {
            return item ? item.split('\r')[0].trim() : '';
          }
        },
        defaultAmount: {
          selector: '#inpProductCount',
          attr: 'value'
        },
        stocked: {
          selector: '.productBox.prod-info .prodImgAndBuy .alert',
          how: 'html',
          convert: (item) => {
            return !(item && item.includes('inte i lager'));
          }
        },
        limitations: {
          selector: '.prodImg .deliveryDays',
          how: 'html',
          convert: (item) => {
            return item ? item.split('\r')[0].trim() : '';
          }
        },
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
            return item ? convertToDecimal(item) : 0;
          }
        },
        priceType: {
          selector: '.productPrice .priceKg > span',
          how: 'html',
          convert: (item) => {
            return item ? item.split('/')[1].trim() : '';
          }
        },
        priceUnit: {
          selector: '.productPrice .priceKg > span',
          how: 'html',
          convert: (item) => {
            return item ? convertToDecimal(item.split('/')[0].replace('ca', '')) : 0;
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
  getMoreProductList,
  getProductDetail
};
