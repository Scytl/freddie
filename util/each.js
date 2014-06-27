var isDefined = function (arg) {
  return typeof arg !== 'undefined';
};

var isArrayLike = function (arg) {
  return arg && isDefined(arg.length);
};

var iterateOrdered = function (arr, fn) {
  for (var index = 0, len = arr.length; index < len; index++) {
    var exit = fn(arr[index], index);
    if (isDefined(exit)) { return exit; }
  }
};

var iterateUnordered = function (obj, fn) {
  for (var prop in obj) {
    var exit = fn(obj[prop], prop);
    if (isDefined(exit)) { return exit; }
  }
};

var each = function (list, fn) {
  if (isArrayLike(list)) { return iterateOrdered(list, fn); }
  return iterateUnordered(list, fn);
};

module.exports = each;
