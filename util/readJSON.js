var readFile      = require('./readFile'),
    stripComments = require('strip-json-comments');

var readJSON = function () {
  var content = readFile.apply(null, arguments);
  if (!content) { return; }
  return JSON.parse(stripComments(content));
};

module.exports = readJSON;
