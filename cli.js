#!/usr/bin/env node
'use strict';

var minimist    = require('minimist'),
    each        = require('./util/each'),
    filter      = require('./util/filter'),
    mix         = require('./util/mix'),
    isArrayLike = require('./util/isArrayLike'),
    readFile    = require('./util/readFile'),
    readJSON    = require('./util/readJSON'),
    fess        = require('./fess');

var pkg = readJSON(__dirname, 'package.json'),
    argv = minimist(process.argv.slice(2)),
    log = console.log;

if (argv.version) { return log(pkg.version); }
if (argv.help) { return log(readFile(__dirname, 'README.md')); }

var configFile = argv.config || ('.' + pkg.name + 'rc'),
    config = argv.noconf ? null : readJSON(configFile);

var servers = isArrayLike(config) ? config : [ config ];

if (argv._.length) {
  servers = filter(servers, function (item) {
    return item && argv._.indexOf(item.name) >= 0;
  });
}

each(servers, function (server) {
  fess(mix(server, argv));
});
