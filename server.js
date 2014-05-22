// helpers

var readJSON = (function () {
    var fs = require('fs');
            
    return function (file, options) {
        var content;
        options = options || {};
        
        try {
            content = fs.readFileSync(file, { encoding: 'utf8' })
        } catch (e) {
            if (e.code === 'ENOENT' && options.fallback) return options.fallback;
            else throw e;
        }
            
        return JSON.parse(content);
    };
})();

var each = (function () {
    return function (obj, callback) {
        Object.keys(obj).forEach(function (index) {
            callback(obj[index], index);
        });
    };
})();

// middlewares

var proxy = (function () {
    var httpProxy = require('http-proxy');
    
    return function (target, context) {
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
})();

var mocks = (function () {
    return function (req, res, next) {
        req.method = 'GET';
        next();
    };
})();

var connect = require('connect'),
    http = require('http'),
    path = require('path'),
    getPort = require('./getport');

var prj = readJSON(path.join(__dirname, 'package.json')),
    cwd = process.cwd(),
    config = readJSON(path.join(cwd, '.' + prj.name + '.json'), { fallback: {} }),
    root = process.argv[2] || config.root || cwd,
    app = connect();

// proxy the requests as defined in configuration
if (config.proxies) {
    each(config.proxies, function (target, context) {
        app.use(context, proxy(target, context));
    });
}

// if not intercepted by proxy, serve static content
app.use(mocks);
app.use(connect.static(root));

getPort(function (err, port) {
    if (err) { throw err; }
    
    http.createServer(app).listen(port);
    console.log('listening to port ' + port);
});
