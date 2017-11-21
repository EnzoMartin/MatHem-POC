const scraper = require('scrape-it');

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
        manufacturer: '.productInfo p > a',
        manufacturerUrl: {
          selector: '.productInfo p > a',
          attr: 'href'
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
    }
  });
}

module.exports = {
  getSidebarLinks,
  getProductList,
  getProductDetail
};
