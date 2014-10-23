var fs            = require('fs'),
    path          = require('path'),
    url           = require('url'),
    dummyJSON     = require('dummy-json'),
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

var fixturesMiddleware = function (root, options) {
  options = options || {};

  var log = options.log || console.log;

  return function (req, res) {
    var pathname = url.parse(req.url).pathname,
        filePath = path.resolve(root, '.' + pathname + '.json');

    fs.readFile(filePath, { encoding: 'utf8' }, function (err, data) {
      var jsonTpl = '',
          content = '';

      if (err) {
        if (err.code === 'ENOENT') {
            log('err not found', filePath);

            res.writeHead(HTTP.ERR_NOT_FOUND, CT.PLAIN_TEXT);
            res.end();
            return;
        }

        log('err unknown', err.toString());

        res.writeHead(HTTP.ERR_UNKNOWN, CT.PLAIN_TEXT);
        res.end(err.toString());
        return;
      }

      try { jsonTpl = stripComments(data); }
      catch (err) {
        log('strip-json-comments err:', err.toString());

        res.writeHead(HTTP.ERR_UNKNOWN, CT.PLAIN_TEXT);
        res.end(err.toString());
        return;
      }

      try { content = dummyJSON.parse(jsonTpl); }
      catch (err) {
        log('dummy-json err:', err.toString());

        res.writeHead(HTTP.ERR_UNKNOWN, CT.PLAIN_TEXT);
        res.end(err.toString());
        return;
      }
      
      log(req.url, '->', filePath);

      res.writeHead(HTTP.ERR_NONE, CT.JSON);
      res.end(content);
    });
  };
};

module.exports = fixturesMiddleware;
