/**
 * From https://github.com/indexzero/node-portfinder
 */

var net = require('net');

var basePort = 3000,
    server = net.createServer(function () {});

/**
 * nextPort()
 *
 * Gets the next port in sequence from the specified `basePort`
 */
var nextPort = (function () {
  var port;

  var getNextPort = function () {
    if (!port) {
      port = basePort;
      return port;
    }

    port++;
    return port;
  };

  return getNextPort;
})();

/**
 * getPort()
 *
 * Responds with a unbound port on the current machine.
 */
var getPort = function (callback) {
  var port = nextPort();

  function onListen () {
    server.removeListener('error', onError);
    server.close();
    callback(null, port)
  }
  
  function onError (err) {
    server.removeListener('listening', onListen);

    if (err.code !== 'EADDRINUSE' && err.code !== 'EACCES') {
      return callback(err);
    }

    getPort(callback);
  }

  server.once('error', onError);
  server.once('listening', onListen);
  server.listen(port);
};

module.exports = getPort;
