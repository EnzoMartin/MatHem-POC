const async = require('async');

let dbm;
let type;
let seed;

exports.setup = function (options, seedLink){
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db, callback){
  async.series([
    db.addColumn.bind(db,'products','defaultAmount',{type:'smallint(1)',defaultValue:1}),
    db.addColumn.bind(db,'products','stocked',{type:'tinyint(1)',defaultValue:1})
  ],callback);
};

exports.down = function (db, callback){
  async.series([
    db.removeColumn.bind(db, 'products','defaultAmount'),
    db.removeColumn.bind(db, 'products','stocked')
  ], callback);
};

exports._meta = {
  version: 1
};
