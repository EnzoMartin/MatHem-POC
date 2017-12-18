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
    db.createTable.bind(db,'similar_map',{
      id:{type:'char(36)',primaryKey:true,notNull:true},
      target:{type:'varchar(255)',notNull:true},
      product:{type:'varchar(255)',notNull:true}
    })
  ],callback);
};

exports.down = function (db, callback) {
  async.series([
    db.dropTable.bind(db, 'similar_map')
  ], callback);
};

exports._meta = {
  version: 1
};
