const async = require('async');
const uuid = require('uuid');

const config = require('../../config');
const { logger, redis } = config;

module.exports = {
  /**
   * Converts a price string into a DB-compatible decimal
   * @param {String} str
   * @returns {Number}
   */
  convertToDecimal: (str) => {
    const converted = str.replace('kr', '').replace(',', '.').trim();
    return parseFloat(converted).toFixed(2);
  },
  /**
   * Diff and add categories to the queue
   * @param {Object} item
   * @param {Array} items
   * @param {Function} callback
   */
  diffCrawledCategories: (item,items,callback) => {
    const id = uuid.v4();
    const diffKey = `diff.${id}`;
    let catLen;

    async.series([
      (callback) => { return redis.sadd('categories.crawled', item.url, callback); },
      (callback) => {
        return items.length ? redis.sadd(diffKey, items, (err, count) => {
          if (!err) {
            catLen = count;
          }
          callback(err);
        }) : callback(null);
      },
      (callback) => {
        return redis.sdiff(diffKey, 'categories.crawled', (err, notCrawled) => {
          redis.del(diffKey);

          if (err) {
            callback(err);
          } else if (notCrawled.length) {
            const toCrawlLen = notCrawled.length;
            const diffLen = (catLen - toCrawlLen).toFixed(0);

            redis.sadd('categories.queued', notCrawled, (err) => {
              logger.info({ item },`Added ${notCrawled.length} categories into the queue, ${diffLen} skipped of ${catLen}`);
              callback(err);
            });
          } else {
            callback(null);
          }
        });
      }
    ], callback);
  },
  /**
   * Diff and add items to the queue
   * @param {Array} items
   * @param {Function} callback
   */
  diffCrawledItems: (items,callback) => {
    const id = uuid.v4();
    const diffKey = `diff.${id}`;
    let itemLen;

    async.series([
      (callback) => {
        return items.length ? redis.sadd(diffKey, items, (err, count) => {
          if (!err) {
            itemLen = count;
          }
          callback(err);
        }) : callback(null);
      },
      (callback) => {
        return redis.sdiff(diffKey, 'items.crawled', (err, notCrawled) => {
          redis.del(diffKey);

          if (err) {
            callback(err);
          } else if (notCrawled.length) {
            const toCrawlLen = notCrawled.length;
            const diffLen = (itemLen - toCrawlLen).toFixed(0);

            redis.sadd('items.queued', notCrawled, (err) => {
              logger.info(`Added ${notCrawled.length} items into the queue, ${diffLen} skipped of ${itemLen}`);
              callback(err);
            });
          } else {
            callback(null);
          }
        });
      }
    ], callback);
  }
};
