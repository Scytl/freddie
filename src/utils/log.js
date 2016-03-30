'use strict';

var chalk = require('chalk');
var moment = require('moment');

var success = chalk.green;
var error = chalk.red;
var time = chalk.grey.bold;
var url = chalk.yellow;
var info = chalk.white;

var log = function (serverName, middlewareName, msg) {
  /*msg.method = method;
  msg.from = from;
  msg.to = to;
  msg.status = statusCode;*/
  var sections = [];
  var status = statusColor(msg.statusCode);
  if (msg.error) {
    sections = [
      time(moment().format('H:mm:ss')),
      info(serverName),
      info(middlewareName),
      status(msg.error),
      url(msg.to),
    ];
  } else {
    sections = [
      time(moment().format('H:mm:ss')),
      info(serverName),
      info(middlewareName),
      status(msg.method),
      url(msg.from),
      info('->'),
      url(msg.to),
      status(msg.statusCode)
    ];
  }
  console.log(sections.join(' '));
};

var statusColor = function (statusCode) {
  return statusCode < 400 ? success : error;
}

module.exports = log;
