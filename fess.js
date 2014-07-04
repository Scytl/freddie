'use strict';

var http        = require('http'),
    connect     = require('connect'),
    serveStatic = require('serve-static'),
    each        = require('./util/each'),
    mix         = require('./util/mix'),
    beacon      = require('./util/beacon'),
    proxy       = require('./middleware/proxy'),
    mock        = require('./middleware/mock');

var logger = function (serverName, middlewareName) {
  return console.log.bind(console, serverName, middlewareName + ':');
};

var defaults = {
  root: process.cwd(),
  port: 3000,
  name: 'server',
  onListen: function (serverName, port) {
    console.log(serverName, 'listening on port', port);
  }
};

var fess = function (options) {
  var config = mix(defaults, options),
      app = connect();
 
  // proxy the requests as defined in configuration
  if (config.proxy) {
    each(config.proxy, function (target, context) {
      app.use(context, proxy(target, {
        context: context,
        log: logger(config.name, 'proxy')
      }));
    });
  }
 
  // if not intercepted by proxy, serve mock content
  if (config.mock) {
    each(config.mock, function (root, context) {
      app.use(context, mock(root, {
        log: logger(config.name, 'mock')
      }));
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
