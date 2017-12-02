/* eslint-disable no-process-env */

const dotenv = require('dotenv');
const bunyan = require('bunyan');
const Promise = require('bluebird');

dotenv.config();

// Promises suck
Promise.promisifyAll(require('scrape-it'));
Promise.promisifyAll(require('ioredis'));
Promise.promisifyAll(require('mysql/lib/Connection').prototype);
Promise.promisifyAll(require('mysql/lib/Pool').prototype);

const mysql = require('mysql');
const Redis = require('ioredis');
const pjson = require('./package.json');

const logger = bunyan.createLogger({
  name:pjson.name,
  serializers: {
    err: bunyan.stdSerializers.err,
    item: (data) => {
      return {
        name: data.name || 'Unknown',
        url: data.url
      };
    }
  }
});

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  connectionLimit: 10
});

const redis = new Redis({
  host:process.env.REDIS_HOST,
  port:process.env.REDIS_PORT,
  keyPrefix:'mathem.scraper.'
});

module.exports = {
  rootUrl: 'https://www.mathem.se',
  logger,
  db,
  redis
};
