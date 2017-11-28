const config = require('../config');
const Models = require('../models');

const { getSidebarLinks } = require('./scraper');

const { logger, redis, db } = config;

function scanSidebar(fragment){
  const url = `${config.rootUrl}${fragment}`;

  getSidebarLinks(url).then((data) => {
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

module.exports = scanSidebar;
