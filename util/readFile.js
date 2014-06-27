var fs = require('fs'),
    path = require('path');

var readFile = function () {
  var file = path.resolve.apply(null, arguments);
  return fs.readFileSync(file, { encoding: 'utf8' });
};

module.exports = readFile;
