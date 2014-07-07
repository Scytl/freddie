'use strict';

var isNumber = require('./isNumber');

var isArrayLike = function (arg) {
  return arg && isNumber(arg.length);
};

module.exports = isArrayLike;
