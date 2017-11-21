const uuid = require('uuid');

// Generics
class Map {
  constructor(data){
    this.id = data.id || uuid.v4();
    this.item = data.item;
  }
}

class WithName {
  constructor(data){
    this.name = data.name;
  }
}

class WithUrl extends WithName {
  constructor(data){
    super(data);
    this.url = data.url;
  }
}

// Specifics
class Item extends WithUrl {
  constructor(data){
    super(data);

    this.offer = data.offer || '';
    this.limitations = data.limitations || '';
    this.content = data.content || '';
    this.priceOriginal = data.priceOriginal || 0.00;
    this.priceReduced = data.priceReduced || 0.00;
    this.priceType = data.priceType || '';
    this.priceKg = data.priceKg || '';
  }
}

class Category extends WithUrl {}
class Badge extends WithUrl {}
class Manufacturer extends WithUrl {}
class Origin extends WithName {}
class Tag extends WithName {}

// Mappings
class CategoryMap extends Map {
  constructor(data){
    super(data);
    this.category = data.category;
  }
}

class BadgeMap extends Map {
  constructor(data){
    super(data);
    this.badge = data.badge;
  }
}

class ManufacturerMap extends Map {
  constructor(data){
    super(data);
    this.manufacturer = data.manufacturer;
  }
}

class OriginMap extends Map {
  constructor(data){
    super(data);
    this.origin = data.origin;
  }
}

class TagMap extends Map {
  constructor(data){
    super(data);
    this.tag = data.tag;
  }
}

module.exports = {
  Item,
  Category,
  Badge,
  Manufacturer,
  Origin,
  Tag,
  CategoryMap,
  BadgeMap,
  ManufacturerMap,
  OriginMap,
  TagMap
};
