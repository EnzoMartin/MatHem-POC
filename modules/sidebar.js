const config = require('../config');

const { getSidebarLinks } = require('./scraper');
const { diffCrawledCategories } = require('./utils');

const { logger } = config;

/**
 * Scan the sidebar for initial categories
 * @param {String} fragment
 * @param {Function} callback
 */
function scanSidebar(fragment, callback){
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
      callback(err);
    });
  }).catch((err) => {
    logger.error({ err }, 'Failed to fetch sidebar');
    callback(err);
  });
}

module.exports = scanSidebar;
