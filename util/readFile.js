var fs = require('fs'),
    path = require('path');

var readFile = function () {
  var file = path.resolve.apply(null, arguments);

  try { return fs.readFileSync(file, { encoding: 'utf8' }); }
  catch (e) { return; }
};

module.exports = readFile;
