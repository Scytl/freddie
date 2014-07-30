var httpProxy     = require('http-proxy'),
    url           = require('url'),
    cookieRewrite = require('../utils/cookieRewrite');

var proxyMiddleware = function (target, options) {
  options = options || {};

  var context = options.context || '',
      log = options.log || console.log;


  /**
   * Allow target definitions with a path part
   * -----------------------------------------
   *
   * Having a target with a path part `host:1234/path/part`
   * and a context `/context`
   *
   *     { '/context': 'host:1234/path/part' }
   *
   * The `/path/part` must be removed from the target and added to the
   * context as a prefix:
   *
   *     target: 'host:1234'
   *     context: '/path/part/context'
   */

  var targetParams = url.parse(target);

  var proxyTarget = url.format({
    protocol: targetParams.protocol,
    host: targetParams.host
  });

  /**
   * Avoid '//' in the context of any requests
   * -----------------------------------------
   *
   * `url.parse` returns `/` as path when no path is defined
   * and the context defined in config must start with `/`
   *
   * To avoid `//context` by concatenating path and context,
   * `/` is removed from path when no path is defined
   */

  var path = targetParams.pathname === '/' ? '' : targetParams.pathname,
      proxyContext = path + context;

  /**
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
   * Host header with the current proxy target
   */

  var proxy = httpProxy.createProxyServer({
    target: proxyTarget,
    secure: false,
    headers: { host: targetParams.host }
  });
  
  
  proxy.on('error', function (err, req, res) {
    var msg = err.toString() + ': ' + proxyTarget + req.url;
    log(msg);

    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(msg);
  });
  
  proxy.on('proxyRes', function (proxyRes, req, res) {
    var request = req.url.replace(path, ''),
        msg = request + ' -> ' + proxyTarget + req.url;

    log(msg);

    /* replace Set-Cookie's Path attribute */

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
    req.url = proxyContext + req.url;
    proxy.web(req, res);
  };
};

module.exports = proxyMiddleware;
