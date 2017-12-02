const config = require('../config');

const { getSidebarLinks } = require('./scraper');
const { diffCrawledCategories } = require('./utils');

const { logger } = config;

function scanSidebar(fragment){
  const url = `${config.rootUrl}${fragment}`;

  getSidebarLinks(url).then((data) => {
    const { menu } = data;

    // Remove first entry as it's homepage
    menu.shift();
    const categories = menu.map((item) => { return item.url; });

    diffCrawledCategories({url: '/', name: 'Home'}, categories, (err) => {
      if(err){
        logger.error({ err }, 'Failed to diff categories from sidebar');
      }
    });
  }).catch((err) => {
    logger.error({ err }, 'Failed to fetch sidebar');
  });
}

module.exports = scanSidebar;
