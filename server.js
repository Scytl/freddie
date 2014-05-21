var config = {
    proxy: {
        '/api': 'http://10.0.16.227:8081'
    }
};

var connect = require('connect'),
    proxy = require('http-proxy').createProxyServer({}),
    http = require('http'),
    getPort = require('./getport');
 
var dir = process.argv[2] || process.env.PWD;

var rewriteToGet = function (req, res, next) {
    req.method = 'GET';
    next();
};

var app = connect();

// proxy the requests as defined in configuration
Object.keys(config.proxy).forEach(function (context) {
    var host = config.proxy[context];

    proxy.on('error', function (err, req, res) {
        var msg = err.code + ': ' + host + req.url;
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(msg);
        console.log('[PROXY] ' + msg);
    });

    proxy.on('proxyRes', function (ev, req, res) {
        var msg = req.url + ' -> ' + host + req.url;
        console.log('[PROXY] ' + msg);
    });

    app.use(context, function (req, res) {
        req.url = context + req.url;
	proxy.web(req, res, { target: host });
    });
});

// if not intercepted by proxy, rewrite all http methods to get
app.use(rewriteToGet)

// finally return static content
app.use(connect.static(dir));
 
getPort(function (err, port) {
  if (err) throw err;

  http.createServer(app).listen(port);
  console.log('listening to port ' + port);
});
