var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    dummyJSON = require('dummy-json'),
    stripComments = require('strip-json-comments');

var ct = function (type) {
  return { 'Content-Type': type };
};

var CT = {
  PLAIN_TEXT: ct('text/plain'),
  JSON: ct('application/json')
};

var HTTP = {
  ERR_NONE: 200,
  ERR_NOT_FOUND: 404,
  ERR_UNKNOWN: 500
};

var mockMiddleware = function (root) {
  return function (req, res) {
    var pathname = url.parse(req.url).pathname,
        filePath = path.resolve(root, '.' + pathname + '.json');

    fs.readFile(filePath, { encoding: 'utf8' }, function (err, data) {
      var content = '';

      if (err) {
        if (err.code === 'ENOENT') {
            res.writeHead(HTTP.ERR_NOT_FOUND, CT.PLAIN_TEXT);
            res.end();
            console.log('[mock] err not found', filePath);
            return;
        }

        res.writeHead(HTTP.ERR_UNKNOWN, CT.PLAIN_TEXT);
        res.end(err.toString());
        console.log('[mock] err unknown', err.toString());
        return;
      }

      try { content = dummyJSON.parse(stripComments(data)); }
      catch (err) {
        res.writeHead(HTTP.ERR_UNKNOWN, CT.PLAIN_TEXT);
        res.end(err.toString());
        console.log('[mock] err unknown', err.toString());
        return;
      }
      
      res.writeHead(HTTP.ERR_NONE, CT.JSON);
      res.end(content);
      console.log('[mock]', req.url, '->', filePath);
    });
  };
};

module.exports = mockMiddleware;
