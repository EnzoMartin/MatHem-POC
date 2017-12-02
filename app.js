/* eslint-disable no-process-exit */

const config = require('./config');
const async = require('async');

const scanSidebar = require('./modules/sidebar');
const scanCategory = require('./modules/category');
const scanProduct = require('./modules/product');

const { logger, redis } = config;

/**
 * Log and error and exit the process
 * @param {Error} err
 * @param {String} message
 */
function logAndDie(err, message){
  logger.fatal({ err }, message);
  console.trace();
  throw err;
}

/**
 * Scan the categories, recursive
 * @param {Error} err
 * @param {Function} callback
 */
function scanCategories(err, callback){
  if(err){
    logAndDie(err, 'Failed to begin scanning categories');
  } else {
    redis.spop('categories.queued', 20, (err, urls) => {
      if(err){
        logAndDie(err, 'Failed to get queued categories');
      } else if(urls.length){
        const operations = urls.map((url) => {
          return (callback) => {
            scanCategory(url, callback);
          };
        });

        async.parallelLimit(operations, 5, (err) => {
          if(err){
            logAndDie(err, 'Failed to fetch categories');
          } else {
            setTimeout(scanCategories, 5000, null, callback);
          }
        });
      } else {
        callback(null);
      }
    });
  }
}

/**
 * Scan the items, recursive
 * @param {Error} err
 * @param {Function} callback
 */
function scanItems(err, callback){
  if(err){
    logAndDie(err, 'Failed to begin scanning items');
  } else {
    redis.spop('items.queued', 1, (err, urls) => {
      if(err){
        logAndDie(err, 'Failed to get queued items');
      } else if(urls.length){
        const operations = urls.map((url) => {
          return (callback) => {
            scanProduct(url, callback);
          };
        });

        async.series(operations, (err) => {
          if(err){
            logAndDie(err, 'Failed to fetch items');
          } else {
            scanItems(null, callback);
          }
        });
      } else {
        callback(null);
      }
    });
  }
}

// Initiate the scan
scanSidebar('/', (err) => {
  if(err){
    logAndDie(err, 'Failed to scan sidebar');
  } else {
    scanCategories(null, (err) => {
      if(err){
        logAndDie(err, 'Failed to scan categories');
      } else {
        logger.info('Finished scanning categories, beginning items');
        scanItems(null, (err) => {
          if(err){
            logAndDie(err, 'Failed to scan items');
          } else {
            logger.info('Finished scanning items');
          }
        });
      }
    });
  }
});
