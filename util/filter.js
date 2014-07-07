'use strict';

var isArrayLike = require('./isArrayLike'),
    each        = require('./each');

var filter = function (list, fn) {
  var isArr = isArrayLike(list),
      filtered = isArr ? [] : {};

  each(list, function (item, index) {
    if (fn(item, index)) {
      if (isArr) { index = filtered.length; }
      filtered[index] = item;
    }
  });

  return filtered;
};

module.exports = filter;
