'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (defaultFile) {
  return function (req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });

    fs.createReadStream(path.resolve(defaultFile)).pipe(res);
  };
};
