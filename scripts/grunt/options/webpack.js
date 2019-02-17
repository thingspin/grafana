const dev = require('../../webpack/webpack.dev.js');
const prod = require('../../webpack/webpack.prod.js');
const fmsDev = require('../../webpack/fms/webpack.dev.js');
const fmsProd = require('../../webpack/fms/webpack.prod.js');

module.exports = function() {
  'use strict';
  return {
    options: {
      stats: false,
    },
    dev: dev,
    prod: prod,
    "fms-dev": fmsDev,
    "fms-prod": fmsProd,
  };
};
