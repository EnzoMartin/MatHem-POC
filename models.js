const uuid = require('uuid');

// Generics
class Map {
  /**
   * Create a new map
   * @param {Object} product
   * @param {Object} target
   */
  constructor(product, target){
    this.id = uuid.v4();
    this.product = product.url;
    this.target = target.url;
  }
}

class SimpleMap extends Map {
  /**
   * Create a new simple map that doesn't contain a URL
   * @param {Object} product
   * @param {Object} target
   */
  constructor(product, target){
    super(product, target);
    this.target = target.name;
  }
}

class WithName {
  /**
   * Create a new object with a name
   * @param {Object} data
   */
  constructor(data){
    this.name = data.name;
  }
}

class WithUrl extends WithName {
  /**
   * Create a new object with a name and URL
   * @param {Object} data
   */
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
class Tag extends WithName {
  constructor(data){
    super(data);
    this.name = this.name.replace('Denna vara är ', '').replace(/[^\w\s]/gi, '').toLowerCase();
  }
}

// Mappings
class CategoriesMap extends Map {}
class BadgesMap extends Map {}
class ManufacturerMap extends Map {}
class OriginsMap extends SimpleMap {}
class TagsMap extends SimpleMap {}
class SimilarMap extends Map {}

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
  TagsMap,
  SimilarMap
};
