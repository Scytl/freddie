var httpProxy = require('http-proxy'),
    url       = require('url');

/**
 * cookieRewrite(cookie, fn)
 * -------------------------
 *
 * `require('cookie').serialize` needs the cookie key and value to be
 * specified in its params:
 *
 *     cookie.serialize(key, value, options)
 *
 * That means we can't pass directly the object returned by
 * `require('cookie').parse`
 *
 * The RFC6265 specifies that the Set-Cookie header must contain just
 * one cookie pair (key=value) at the beginning followed by the cookie
 * attributes
 */

var cookieRewrite = function (cookie, fn) {
  var cookieModule = require('cookie');

  var parse = cookieModule.parse,
      serialize = cookieModule.serialize;

  var tokens = cookie.split(/; */),
      pair = parse(tokens.shift()),
      name = Object.keys(pair)[0],
      value = pair[name],
      attrs = parse(tokens.join('; '));

  var attrsMap = {
    name: name,
    value: value
  };

  /**
   * Add cookie defined attributes only
   * ----------------------------------
   *
   * This is only required with `Expires` attribute to avoid passing
   * undefined to `new Date()` causing a `Expires` value of the current date
   *
   * `new Date()` is required because `cookie.serialize expects from `expires`
   * to be a date
   *
   * For consistency, the approach is extended to all the attributes
   */

  if (attrs['Max-Age']) { attrsMap.maxage = attrs['Max-Age']; }
  if (attrs['Expires']) { attrsMap.expires = new Date(attrs['Expires']); }
  if (attrs['Path']) { attrsMap.path = attrs['Path']; }
  if (attrs['Domain']) { attrsMap.domain = attrs['Domain']; }
  if (attrs['Secure']) { attrsMap.secure = attrs['Secure']; }
  if (attrs['HttpOnly']) { attrsMap.httpOnly = attrs['HttpOnly']; }

  var parsedCookie = fn(attrsMap);

  return serialize(parsedCookie.name, parsedCookie.value, parsedCookie);
};

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
        cookie.path = cookie.path.replace(path, '');
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
