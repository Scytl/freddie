var http        = require('http'),
    connect     = require('connect'),
    serveStatic = require('serve-static'),
    each        = require('./util/each'),
    beacon      = require('./util/beacon'),
    proxy       = require('./middleware/proxy'),
    mock        = require('./middleware/mock');

var fess = function (config) {
  var app = connect();
 
  // proxy the requests as defined in configuration
  if (config.proxy) {
    var log = console.log.bind(console, config.name, 'proxy:');
    each(config.proxy, function (target, context) {
      app.use(context, proxy(target, {
        context: context,
        log: log
      }));
    });
  }
 
  // if not intercepted by proxy, serve mock content
  if (config.mock) {
    var log = console.log.bind(console, config.name, 'mock:');
    each(config.mock, function (root, context) {
      app.use(context, mock(root, { log: log }));
    });
  }

  // if not intercepted by mock, serve static content
  app.use(serveStatic(config.root));
 
  beacon(config.port, function (err, port) {
    if (err) { throw err; }
    http.createServer(app).listen(port, function () {
      config.onListen(config.name, port);
    });
  });
};

module.exports = fess;
