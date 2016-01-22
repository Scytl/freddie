var fs = require('fs');
var path = require('path');
var url = require('url');
var dummyJSON = require('dummy-json');
var stripComments = require('strip-json-comments');

var HTTP = {
  ERR_NONE: 200,
  ERR_NOT_FOUND: 404,
  ERR_UNKNOWN: 500
};

var isDefined = function (arg) {
  return typeof arg !== 'undefined';
};

module.exports = function (root, options) {
  options = options || {};

  var log = options.log || console.log;

  return function (req, res) {
    var pathname = url.parse(req.url).pathname;
    var filePath = path.resolve(root, '.' + pathname + '.json');

    fs.readFile(filePath, { encoding: 'utf8' }, function (err, data) {
      var jsonTpl = '';
      var jsonContent = '';

      if (err) {
        if (err.code === 'ENOENT') {
            log('err not found', filePath);

            res.writeHead(HTTP.ERR_NOT_FOUND, { 'Content-Type': 'text/plain' });
            res.end();
            return;
        }

        log('err unknown', err.toString());

        res.writeHead(HTTP.ERR_UNKNOWN, { 'Content-Type': 'text/plain' });
        res.end(err.toString());
        return;
      }

      try { jsonTpl = stripComments(data); }
      catch (err) {
        log('strip-json-comments err:', err.toString());

        res.writeHead(HTTP.ERR_UNKNOWN, { 'Content-Type': 'text/plain' });
        res.end(err.toString());
        return;
      }

      try { jsonContent = dummyJSON.parse(jsonTpl); }
      catch (err) {
        log('dummy-json err:', err.toString());

        res.writeHead(HTTP.ERR_UNKNOWN, { 'Content-Type': 'text/plain' });
        res.end(err.toString());
        return;
      }

      log(req.url, '->', filePath);

      var response = JSON.parse(jsonContent || '{}');
      response = isDefined(response.body) ? response : { body: response }

      response.status = response.status || HTTP.ERR_NONE;
      response.headers = response.headers || {};
      response.latency = response.latency || 0;

      if (!response.headers['Content-Type']) {
        response.headers['Content-Type'] = 'application/json';
      }

      setTimeout(function () {
        res.writeHead(response.status, response.headers);
        res.end(JSON.stringify(response.body));
      }, response.latency);
    });
  };
};
