var connect = require('connect'),
    serveStatic = require('serve-static'),
    http = require('http');
    
var each = require('./util/each'),
    beacon = require('./util/beacon'),
    proxy = require('./middleware/proxy'),
    mocks = require('./middleware/mocks');

var fess = function (config) {
  var app = connect();
 
  // proxy the requests as defined in configuration
  if (config.proxy) {
    each(config.proxy, function (target, context) {
      app.use(context, proxy(target, context));
    });
  }
 
  // if not intercepted by proxy, serve static content
  app.use(mocks);
  app.use(serveStatic(config.root));
 
  beacon(config.port, function (err, port) {
    if (err) { throw err; }
    http.createServer(app).listen(port);
    console.log(config.name, 'listening on port', port);
  });
};

module.exports = fess;
