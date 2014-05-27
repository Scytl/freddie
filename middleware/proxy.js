var httpProxy = require('http-proxy'),
    url = require('url');

var proxyMiddleware = function (target, context) {
  context = context || '';

  /**
   * Allow target definitions with a path part
   * -----------------------------------------
   *
   * Having a target with a path part `host:1234/path/part`
   * and a context `/context`
   *
   * The `/path/part` must be removed from the target and added to the
   * context as a prefix:
   *
   *     target: 'host:1234'
   *     context: '/path/part/context'
   */

  var targetParams = url.parse(target),
      proxyTarget = url.format({
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
   * Create the proxy
   * ----------------
   *
   * Use `secure: true` to access https targets without cert
   */

  var proxy = httpProxy.createProxyServer({
    target: proxyTarget,
    secure: false
  });
  
  
  proxy.on('error', function (err, req, res) {
    var msg = err.toString() + ': ' + proxyTarget + req.url;
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(msg);
    console.log('[PROXY] ' + msg);
  });
  
  proxy.on('proxyRes', function (ev, req, res) {
    var request = req.url.replace(path, ''),
        msg = request + ' -> ' + proxyTarget + req.url;

    console.log('[PROXY] ' + msg);
  });
  
  return function (req, res) {
    req.url = proxyContext + req.url;
    proxy.web(req, res);
  };
};

module.exports = proxyMiddleware;
