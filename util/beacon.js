/* from https://github.com/indexzero/node-portfinder */

var net = require('net');

var beacon = function (port, fn) {
  var server = net.createServer(function () {});

  var onListen = function () {
    server.removeListener('error', onError);
    server.close();
    fn(null, port)
  };
  
  var onError = function (err) {
    server.removeListener('listening', onListen);

    if (err.code !== 'EADDRINUSE' && err.code !== 'EACCES') {
      return fn(err);
    }

    beacon(port + 1, fn);
  };

  server.once('error', onError);
  server.once('listening', onListen);
  server.listen(port);
};

module.exports = beacon;
