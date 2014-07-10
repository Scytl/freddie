#!/usr/bin/env node
'use strict';

var minimist    = require('minimist'),
    each        = require('./utils/each'),
    filter      = require('./utils/filter'),
    mix         = require('./utils/mix'),
    isArrayLike = require('./utils/isArrayLike'),
    readFile    = require('./utils/readFile'),
    readJSON    = require('./utils/readJSON'),
    freddie     = require('./freddie');

var pkg = readJSON(__dirname, '..', 'package.json'),
    argv = minimist(process.argv.slice(2)),
    log = console.log;

if (argv.version) { return log(pkg.version); }
if (argv.help) { return log(readFile(__dirname, '..', 'README.md')); }

var configFile = argv.config || ('.' + pkg.name + 'rc'),
    config = argv.noconf ? null : readJSON(configFile);

var servers = isArrayLike(config) ? config : [ config ];

if (argv._.length) {
  servers = filter(servers, function (item) {
    return item && argv._.indexOf(item.name) >= 0;
  });
}

each(servers, function (server) {
  freddie(mix(server, argv));
});
