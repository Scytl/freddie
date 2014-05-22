var connect = require('connect'),
    http = require('http'),
    path = require('path'),
    each = require('./each'),
    getPort = require('./get-port'),
    readJson = require('./read-json'),
    mocks = require('./mocks-middleware'),
    proxy = require('./proxy-middleware');

var prj = readJson(path.join(__dirname, 'package.json')),
    cwd = process.cwd(),
    config = readJson(path.join(cwd, '.' + prj.name + '.json'), { fallback: {} }),
    root = process.argv[2] || config.root || cwd,
    app = connect();

// proxy the requests as defined in configuration
if (config.proxy) {
    each(config.proxy, function (target, context) {
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
