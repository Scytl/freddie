'use strict';

var chalk = require('chalk');
var moment = require('moment');

var red = chalk.red;
var green = chalk.green;
var blue = chalk.blue;
var yellow = chalk.yellow;
var hour = chalk.grey.bold;

var log = function (serverName, middlewareName, method, from, to, status) {
  if (arguments.length === 3) {
    console.log(red(a), hour(moment().format('H:mm:ss')), red(method));
    return;
  }
  var color = green;
  if (status >= 400) {
    color = red;
  }

  console.log('%s %s' + hour(' %s ') + color('[%s] ') + yellow('%s -> %s ') + color('[%d]'),
              serverName, middlewareName, moment().format('H:mm:ss'), method, from, to, status);
};

module.exports = log;
