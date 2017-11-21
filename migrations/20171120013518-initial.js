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
      priceOriginal:{type:'decimal(20,2)'},
      priceReduced:{type:'decimal(20,2)'},
      priceType:{type:'varchar(255)'},
      priceKg:{type:'varchar(255)'}
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
      name:{type:'varchar(255)',primaryKey:true,notNull:true},
      url:{type:'text',notNull:true}
    }),
    // Mapping tables
    db.createTable.bind(db,'category_map',{
      id:{type:'char(36)',primaryKey:true,notNull:true},
      category:{type:'varchar(255)',notNull:true},
      product:{type:'varchar(255)',notNull:true}
    }),
    db.createTable.bind(db,'origin_map',{
      id:{type:'char(36)',primaryKey:true,notNull:true},
      origin:{type:'varchar(255)',notNull:true},
      product:{type:'varchar(255)',notNull:true}
    }),
    db.createTable.bind(db,'manufacturer_map',{
      id:{type:'char(36)',primaryKey:true,notNull:true},
      manufacturer:{type:'varchar(255)',notNull:true},
      product:{type:'varchar(255)',notNull:true}
    }),
    db.createTable.bind(db,'tag_map',{
      id:{type:'char(36)',primaryKey:true,notNull:true},
      tag:{type:'varchar(255)',notNull:true},
      product:{type:'varchar(255)',notNull:true}
    }),
    db.createTable.bind(db,'badge_map',{
      id:{type:'char(36)',primaryKey:true,notNull:true},
      badge:{type:'varchar(255)',notNull:true},
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
    db.dropTable.bind(db, 'category_map'),
    db.dropTable.bind(db, 'origin_map'),
    db.dropTable.bind(db, 'manufacturer_map'),
    db.dropTable.bind(db, 'tag_map'),
    db.dropTable.bind(db, 'badge_map')
  ], callback);
};

exports._meta = {
  version: 1
};
