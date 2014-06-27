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
    each(config.proxy, function (target, context) {
      app.use(context, proxy(target, context));
    });
  }
 
  // if not intercepted by proxy, serve mock content
  if (config.mock) {
    each(config.mock, function (root, context) {
      app.use(context, mock(root));
    });
  }

  // if not intercepted by mock, serve static content
  app.use(serveStatic(config.root));
 
  beacon(config.port, function (err, port) {
    if (err) { throw err; }
    http.createServer(app).listen(port);
    console.log(config.name, 'listening on port', port);
  });
};

module.exports = fess;
