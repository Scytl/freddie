var httpProxy = require('http-proxy');

var proxyMiddleware = function (target, context) {
    var proxy = httpProxy.createProxyServer({});
    
    proxy.on('error', function (err, req, res) {
        var msg = err.code + ': ' + target + req.url;
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(msg);
        console.log('[PROXY] ' + msg);
    });
    
    proxy.on('proxyRes', function (ev, req, res) {
        var msg = req.url + ' -> ' + target + req.url;
        console.log('[PROXY] ' + msg);
    });
    
    return function (req, res) {
        if (context) { req.url = context + req.url; }
        proxy.web(req, res, { target: target });
    };
};

module.exports = proxyMiddleware;