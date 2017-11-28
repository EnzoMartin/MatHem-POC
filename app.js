const config = require('./config');
const async = require('async');

const scanSidebar = require('./modules/sidebar');
const scanCategory = require('./modules/category');
const scanProduct = require('./modules/product');

// scanSidebar(config.rootUrl);

// scanProduct('/varor/banan/banan-eko-klass1');
// scanProduct('/varor/saffran/saffran-0-5g-kockens');
// scanProduct('/varor/valnotter/valnotter-med-skal-jumbo-eko-500g-klass1');
scanCategory('/varor/frukt--och-gronsakskassar');
