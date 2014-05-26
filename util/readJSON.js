var fs = require('fs'),
    path = require('path');

var readJSON = function () {
  var file = path.join.apply(null, arguments),
      content = fs.readFileSync(file, { encoding: 'utf8' });
      
  return JSON.parse(content);
};

module.exports = readJSON;