'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (config) {
  var status = config.status || 404;
  var filePath = config.path;

  return function (req, res) {
    res.writeHead(status, {
      'Content-Type': 'text/html'
    });

    fs.createReadStream(path.resolve(filePath)).pipe(res);
  };
};
