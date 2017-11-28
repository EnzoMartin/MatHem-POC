const uuid = require('uuid');

// Generics
class Map {
  constructor(product, target){
    this.id = uuid.v4();
    this.product = product.url;
    this.target = target.url;
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
    this.image = data.image || '';
    this.priceOriginal = data.priceOriginal || 0.00;
    this.priceReduced = data.priceReduced || 0.00;
    this.priceType = data.priceType || '';
    this.priceUnit = data.priceUnit || 0.00;
  }
}

class Category extends WithUrl {}
class Badge extends WithUrl {
  constructor(data){
    super(data);
    this.text = data.text || this.name;
  }
}
class Manufacturer extends WithUrl {}
class Origin extends WithName {}
class Tag extends WithName {}

// Mappings
class CategoriesMap extends Map {}
class BadgesMap extends Map {}
class ManufacturerMap extends Map {}
class OriginsMap extends Map {}
class TagsMap extends Map {}

module.exports = {
  Item,
  Category,
  Badge,
  Manufacturer,
  Origin,
  Tag,
  CategoriesMap,
  BadgesMap,
  ManufacturerMap,
  OriginsMap,
  TagsMap
};
