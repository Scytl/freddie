var cookie = require('cookie');

var parse = cookie.parse,
    serialize = cookie.serialize;

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
  var tokens = cookie.split(/; */),
      pair = parse(tokens.shift()),
      name = Object.keys(pair)[0],
      value = pair[name],
      attrs = parse(tokens.join('; '));

  var attrsMap = {
    name: name,
    value: value
  };

  // accept lowercase attributes

  attrs['Max-Age']  = attrs['Max-Age']  || attrs['max-age'];
  attrs['Expires']  = attrs['Expires']  || attrs['expires'];
  attrs['Path']     = attrs['Path']     || attrs['path'];
  attrs['Domain']   = attrs['Domain']   || attrs['domain'];
  attrs['Secure']   = attrs['Secure']   || attrs['secure'];
  attrs['HttpOnly'] = attrs['HttpOnly'] || attrs['httponly'];

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

  if (attrs['Max-Age'])  { attrsMap.maxage   = attrs['Max-Age']; }
  if (attrs['Expires'])  { attrsMap.expires  = new Date(attrs['Expires']); }
  if (attrs['Path'])     { attrsMap.path     = attrs['Path']; }
  if (attrs['Domain'])   { attrsMap.domain   = attrs['Domain']; }
  if (attrs['Secure'])   { attrsMap.secure   = attrs['Secure']; }
  if (attrs['HttpOnly']) { attrsMap.httpOnly = attrs['HttpOnly']; }

  var parsedCookie = fn(attrsMap);

  return serialize(parsedCookie.name, parsedCookie.value, parsedCookie);
};

module.exports = cookieRewrite;
