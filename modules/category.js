const config = require('../config');
const Models = require('../models');

const { getProductList } = require('./scraper');

const { logger, db } = config;

function scanCategory(fragment){
  const url = `${config.rootUrl}${fragment}`;

  getProductList(url).then((data) => {
    console.log(data);
  });
}

module.exports = scanCategory;
