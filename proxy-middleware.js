var httpProxy = require('http-proxy'),
    url = require('url');

var proxyMiddleware = function (target, context) {
    var proxy = httpProxy.createProxyServer({});

    /**
     * Having a target with a path part: 'host:1234/path/part'
     * and a context: '/context'
     *
     * The '/path/part' must me removed from the target and added to the
     * context as a prefix:
     *
     * target: 'host:1234'
     * context: '/path/part/context'
     */
    context = context || '';

    var targetParams = url.parse(target)
        proxyTarget = url.format({
            protocol: targetParams.protocol,
            host: targetParams.host
        }),
        proxyContext = targetParams.pathname + context;

    
    proxy.on('error', function (err, req, res) {
        var msg = err.code + ': ' + target + req.url;
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(msg);
        console.log('[PROXY] ' + msg);
    });
    
    proxy.on('proxyRes', function (ev, req, res) {
        var request = req.url.replace(targetParams.pathname, ''),
            msg = request + ' -> ' + target + req.url;

        console.log('[PROXY] ' + msg);
    });
    
    return function (req, res) {
        req.url = proxyContext + req.url;
        proxy.web(req, res, { target: proxyTarget });
    };
};

module.exports = proxyMiddleware;
