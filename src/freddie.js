/**
 * freddie
 * =======
 *
 * Priority of request interceptors
 * --------------------------------
 *
 *  1. proxy
 *  2. fixtures
 *  3. static
 *  4. notfound
 */

'use strict';

var http = require('http');
var connect = require('connect');
var serveStatic = require('serve-static');
var each = require('./utils/each');
var mix = require('./utils/mix');
var beacon = require('./utils/beacon');
var proxy = require('./middleware/proxy');
var fixtures = require('./middleware/fixtures');
var notfound = require('./middleware/notfound');

var logger = function (serverName, middlewareName) {
  return console.log.bind(console, serverName, middlewareName + ':');
};

var DEFAULTS = {
  root: process.cwd(),
  port: 3000,
  name: 'server',
  onListen: function (serverName, port) {
    console.log(serverName, 'listening on port', port);
  }
};

module.exports = function (options) {
  var config = mix(DEFAULTS, options);
  var app = connect();

  if (config.proxy) {
    each(config.proxy, function (target, context) {
      app.use(context, proxy(target, {
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
