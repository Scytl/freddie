var httpProxy = require('http-proxy'),
    url = require('url');

var proxyMiddleware = function (target, context) {
    var proxy = httpProxy.createProxyServer({});
    context = context || '';

    /**
     * Allow target definitions with a path part
     *
     * Having a target with a path part: 'host:1234/path/part'
     * and a context: '/context'
     *
     * The '/path/part' must me removed from the target and added to the
     * context as a prefix:
     *
     * target: 'host:1234'
     * context: '/path/part/context'
     */

    /**
     * Avoid '//' in the context of any requests
     *
     * url.parse returns '/' as path when no path is defined
     * and the context definition must start with '/'
     *
     * To avoid '//context' by concatenating path and context,
     * '/' is removed from path when no path is defined
     */

    var targetParams = url.parse(target)
        proxyTarget = url.format({
            protocol: targetParams.protocol,
            host: targetParams.host
        }),
        path = targetParams.pathname === '/' ? '' : targetParams.pathname,
        proxyContext = path + context;

    
    proxy.on('error', function (err, req, res) {
        var msg = err.toString() + ': ' + target + req.url;
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(msg);
        console.log('[PROXY] ' + msg);
    });
    
    proxy.on('proxyRes', function (ev, req, res) {
        var request = req.url.replace(path, ''),
            msg = request + ' -> ' + target + req.url;

        console.log('[PROXY] ' + msg);
    });
    
    return function (req, res) {
        req.url = proxyContext + req.url;
        proxy.web(req, res, { target: proxyTarget });
    };
};

module.exports = proxyMiddleware;
