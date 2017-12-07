const async = require('async');

const config = require('../../config');
const Models = require('../models');

const { diffCrawledCategories, diffCrawledItems } = require('./utils');
const { getProductList, getMoreProductList } = require('./scraper');

const { logger, db } = config;

/**
 * Scan a category and queue all it's subcategories and items
 * @param {String} fragment
 * @param {Function} callback
 */
function scanCategory(fragment, callback){
  const url = `${config.rootUrl}${fragment}`;

  getProductList(url).then((data) => {
    const fetchMoreUrl = `${config.rootUrl}${data.more}`;
    const totalItems = data.total;
    const perPage = 28;
    const totalPages = Math.ceil(totalItems / perPage);
    const pages = [];
    const category = new Models.Category(data);

    // Build list of categories to queue for further crawling
    const categories = data.categories.map((item) => { return item.url; }).concat(
      data.subcategories.map((item) => { return item.url; })
    );

    // Start on page 2 since page 1 is part of the initial category
    for(let page = 2; page <= totalPages; page++){
      pages.push(getMoreProductList(fetchMoreUrl.replace('pageIndex=1',`pageIndex=${page}`)));
    }

    // Flatten items for URLs
    const items = data.items.map((item) => { return item.url; });

    const tasks = {
      insertCategory: (callback) => {
        const insertCategory = db.query('INSERT INTO categories SET ? ON DUPLICATE KEY UPDATE ?', [category, category], (err) => {
          if(err){
            logger.error({ err, query: insertCategory.sql }, `Failed to insert category ${category.name}`);
          }
          callback(err);
        });
      },
      diffCategories: (callback) => {
        diffCrawledCategories(category, categories, (err) => {
          if(err){
            logger.error({ err }, 'Failed to diff categories');
          }
          callback(err);
        });
      },
      diffItems: (callback) => {
        Promise.all(pages).then((data) => {
          data.forEach((item) => {
            items.push(...item.items.map((item) => { return item.url; }));
          });

          diffCrawledItems(items, (err) => {
            if(err){
              logger.error({ err }, 'Failed to diff items');
            }
            callback(err);
          });
        }).catch((err) => {
          logger.error({ err, item: category }, `Failed to get all items for ${category.name}`);
          callback(err);
        });
      }
    };

    async.parallel(tasks, callback);
  }).catch((err) => {
    logger.error({ err }, `Failed to get category ${fragment}`);
    callback(err);
  });
}

module.exports = scanCategory;
