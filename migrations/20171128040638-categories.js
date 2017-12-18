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
    db.addColumn.bind(db,'categories','title',{type:'varchar(255)'}),
    db.addColumn.bind(db,'categories','description',{type:'text'})
  ],callback);
};

exports.down = function (db, callback) {
  async.series([
    db.removeColumn.bind(db, 'categories','title'),
    db.removeColumn.bind(db, 'categories','description')
  ], callback);
};

exports._meta = {
  version: 1
};
