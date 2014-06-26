var readFile = require('./readFile');

var readJSON = function () {
  return JSON.parse(readFile.apply(null, arguments));
};

module.exports = readJSON;
