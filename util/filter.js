var each = require('./each');

var isNumber = function (arg) {
  return typeof arg === 'number';
};

var isArrayLike = function (arg) {
  return arg && isNumber(arg.length);
};

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
