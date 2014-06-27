var readFile = require('./readFile'),
    stripComments = require('strip-json-comments');

var readJSON = function () {
  return JSON.parse(stripComments(readFile.apply(null, arguments)));
};

module.exports = readJSON;
