'use strict';

var path          = require('path'),
    readFile      = require('./readFile'),
    stripComments = require('strip-json-comments');

var readJSON = function () {
  var file = path.resolve.apply(null, arguments),
      content = readFile(file);

  if (!content) { return; }

  try { return JSON.parse(stripComments(content)); }
  catch (e) { return console.error('error parsing JSON:', file); }
};

module.exports = readJSON;
