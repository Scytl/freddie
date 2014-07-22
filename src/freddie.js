'use strict';

var http        = require('http'),
    connect     = require('connect'),
    serveStatic = require('serve-static'),
    each        = require('./utils/each'),
    mix         = require('./utils/mix'),
    beacon      = require('./utils/beacon'),
    proxy       = require('./middleware/proxy'),
    fixtures    = require('./middleware/fixtures');

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

var freddie = function (options) {
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
 
  // if not intercepted by proxy, respond with fixtures
  if (config.fixtures) {
    each(config.fixtures, function (root, context) {
      app.use(context, fixtures(root, {
        log: logger(config.name, 'fixtures')
      }));
    });
  }

  // if not intercepted, serve static content by default
  app.use(serveStatic(config.root));
 
  beacon(config.port, function (err, port) {
    if (err) { throw err; }
    http.createServer(app).listen(port, function () {
      config.onListen(config.name, port);
    });
  });
};

module.exports = freddie;
