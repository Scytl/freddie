/**
 * From https://github.com/indexzero/node-portfinder
 */

var net = require('net');

/**
 * nextPort(basePort)
 *
 * Gets the next port in sequence from the specified `basePort`
 */
var nextPort = (function () {
  var port;

  var getNextPort = function (basePort) {
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
 * beacon()
 *
 * Responds with a unbound port on the current machine.
 */
var beacon = function (basePort, callback) {
  var server = net.createServer(function () {}),
      port = nextPort(basePort);

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

    beacon(basePort, callback);
  }

  server.once('error', onError);
  server.once('listening', onListen);
  server.listen(port);
};

module.exports = beacon;
