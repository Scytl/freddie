/**
 * proxy
 * =====
 *
 * Proxy to HTTPS without using certs
 * ----------------------------------
 *
 * Use `secure: false` in the proxy configuration to access HTTPS targets
 * without cert
 *
 * Rewrite request Host header by using the proxy target
 * -----------------------------------------------------
 *
 * Use `headers: { host: <new host> }` in proxy configuration to rewrite the
 * `Host` header with the current proxy target
 */

'use strict';

var httpProxy = require('http-proxy');
var url = require('url');
var cookieRewrite = require('../utils/cookieRewrite');

module.exports = function (target, options) {
  target = url.parse(target);
  options = options || {};

  var logger = options.log || console.log;

  var host = url.format({
    protocol: target.protocol,
    host: target.host
  });

  var path = target.pathname || '';
  if (path === '/') { path = ''; }

  var proxy = httpProxy.createProxyServer({
    target: host,
    secure: false,
    headers: { host: target.host }
  });

  proxy.on('error', function (err, req, res) {
    var msg = err.toString() + ': ' + host + req.url;
    logger(msg);

    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(msg);
  });

  proxy.on('proxyRes', function (proxyRes, req, res) {
    var from = req.url;
    if (req.url !== path) {
      from = req.url.replace(path, '');
    }

    logger(req.method, from, host + req.url, proxyRes.statusCode);

    var headers = proxyRes.headers;
    if (!headers['set-cookie']) { return; }

    headers['set-cookie'] = headers['set-cookie'].map(function (cookie) {
      return cookieRewrite(cookie, function (cookie) {
        if (cookie.path) { cookie.path = cookie.path.replace(path, ''); }
        return cookie;
      });
    });
  });

  return function (req, res) {
    req.url = path + req.url.replace(/^[/][?]/, '?').replace(/^[/]$/, '');
    proxy.web(req, res);
  };
};
