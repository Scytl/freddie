'use strict';

var http        = require('http'),
    connect     = require('connect'),
    serveStatic = require('serve-static'),
    each        = require('./utils/each'),
    mix         = require('./utils/mix'),
    beacon      = require('./utils/beacon'),
    proxy       = require('./middleware/proxy'),
    fixtures    = require('./middleware/fixtures'),
    notfound    = require('./middleware/notfound');

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


/**
 * priority of request interceptors:
 * 
 *  1. proxy
 *  2. fixtures
 *  3. static
 *  4. notfound
 */

var freddie = function (options) {
  var config = mix(defaults, options),
      app = connect();
 
  if (config.proxy) {
    each(config.proxy, function (target, context) {
      app.use(context, proxy(target, {
        context: context,
        log: logger(config.name, 'proxy')
      }));
    });
  }
 
  if (config.fixtures) {
    each(config.fixtures, function (root, context) {
      app.use(context, fixtures(root, {
        log: logger(config.name, 'fixtures')
      }));
    });
  }

  app.use(serveStatic(config.root));

  if (config.notfound) {
    app.use(notfound(config.notfound));
  }
 
  beacon(config.port, function (err, port) {
    if (err) { throw err; }
    http.createServer(app).listen(port, function () {
      config.onListen(config.name, port);
    });
  });
};

module.exports = freddie;
