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
    db.createTable.bind(db,'products',{
      url:{type:'varchar(255)',primaryKey:true,notNull:true},
      name:{type:'varchar(255)',notNull:true},
      offer:{type:'varchar(255)'},
      limitations:{type:'varchar(255)'},
      content:{type:'text'},
      image:{type:'text'},
      priceOriginal:{type:'decimal(20,2)'},
      priceReduced:{type:'decimal(20,2)'},
      priceType:{type:'varchar(255)'},
      priceUnit:{type:'decimal(20,2)'}
    }),
    // Meta tables
    db.createTable.bind(db,'categories',{
      url:{type:'varchar(255)',primaryKey:true,notNull:true},
      name:{type:'varchar(255)',notNull:true}
    }),
    db.createTable.bind(db,'origins',{
      name:{type:'varchar(255)',primaryKey:true,notNull:true}
    }),
    db.createTable.bind(db,'manufacturer',{
      url:{type:'varchar(255)',primaryKey:true,notNull:true},
      name:{type:'varchar(255)',notNull:true}
    }),
    db.createTable.bind(db,'tags',{
      name:{type:'varchar(255)',primaryKey:true,notNull:true}
    }),
    db.createTable.bind(db,'badges',{
      url:{type:'varchar(255)',primaryKey:true,notNull:true},
      name:{type:'varchar(255)',notNull:true},
      text:{type:'varchar(255)'}
    }),
    // Mapping tables
    db.createTable.bind(db,'categories_map',{
      id:{type:'char(36)',primaryKey:true,notNull:true},
      target:{type:'varchar(255)',notNull:true},
      product:{type:'varchar(255)',notNull:true}
    }),
    db.createTable.bind(db,'origins_map',{
      id:{type:'char(36)',primaryKey:true,notNull:true},
      target:{type:'varchar(255)',notNull:true},
      product:{type:'varchar(255)',notNull:true}
    }),
    db.createTable.bind(db,'manufacturer_map',{
      id:{type:'char(36)',primaryKey:true,notNull:true},
      target:{type:'varchar(255)',notNull:true},
      product:{type:'varchar(255)',notNull:true}
    }),
    db.createTable.bind(db,'tags_map',{
      id:{type:'char(36)',primaryKey:true,notNull:true},
      target:{type:'varchar(255)',notNull:true},
      product:{type:'varchar(255)',notNull:true}
    }),
    db.createTable.bind(db,'badges_map',{
      id:{type:'char(36)',primaryKey:true,notNull:true},
      target:{type:'varchar(255)',notNull:true},
      product:{type:'varchar(255)',notNull:true}
    })
  ],callback);
};

exports.down = function (db, callback){
  async.series([
    db.dropTable.bind(db, 'products'),
    db.dropTable.bind(db, 'categories'),
    db.dropTable.bind(db, 'origins'),
    db.dropTable.bind(db, 'manufacturer'),
    db.dropTable.bind(db, 'tags'),
    db.dropTable.bind(db, 'badges'),
    db.dropTable.bind(db, 'categories_map'),
    db.dropTable.bind(db, 'origins_map'),
    db.dropTable.bind(db, 'manufacturer_map'),
    db.dropTable.bind(db, 'tags_map'),
    db.dropTable.bind(db, 'badges_map')
  ], callback);
};

exports._meta = {
  version: 1
};
