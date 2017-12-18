const async = require('async');

let dbm;
let type;
let seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db, callback) {
  async.series([
    db.addColumn.bind(db,'categories','parent',{type:'varchar(255)'})
  ],callback);
};

exports.down = function (db, callback) {
  async.series([
    db.removeColumn.bind(db, 'categories','parent')
  ], callback);
};

exports._meta = {
  version: 1
};
