const config = require('../config');
const Models = require('../models');
const { diffCrawledCategories, diffCrawledItems } = require('./utils');

const { getProductList, getMoreProductList } = require('./scraper');

const { logger, db } = config;

function scanCategory(fragment){
  const url = `${config.rootUrl}${fragment}`;

  getProductList(url).then((data) => {

    const fetchMoreUrl = `${config.rootUrl}${data.more}`;
    const totalItems = data.total;
    const perPage = 28;
    const totalPages = Math.ceil(totalItems / perPage);
    const pages = [];


    const category = new Models.Category(data);
    const insertCategory = db.query('INSERT INTO categories SET ? ON DUPLICATE KEY UPDATE ?', [category, category], (err) => {
      if(err){
        logger.error({ err, query: insertCategory.sql }, `Failed to insert category ${category.name}`);
      }
    });

    // Build list of categories to queue for further crawling
    const categories = data.categories.map((item) => { return item.url; }).concat(
      data.subcategories.map((item) => { return item.url; })
    );

    diffCrawledCategories(category, categories, (err) => {
      if(err){
        logger.error({ err }, 'Failed to diff categories');
      }
    });

    // Start on page 2 since page 1 is part of the initial category
    for(let page = 2; page <= totalPages; page++){
      pages.push(getMoreProductList(fetchMoreUrl.replace('pageIndex=1',`pageIndex=${page}`)));
    }

    const items = data.items.map((item) => { return item.url; });
    Promise.all(pages).then((data) => {
      data.forEach((item) => {
        items.push(...item.items.map((item) => { return item.url; }));
      });

      diffCrawledItems(items, (err) => {
        if(err){
          logger.error({ err }, 'Failed to diff items');
        }
      });
    }).catch((err) => {
      logger.error({ err, item: category }, `Failed to get all items for ${category.name}`);
    });
  }).catch((err) => {
    logger.error({ err }, `Failed to get category ${fragment}`);
  });
}

module.exports = scanCategory;
