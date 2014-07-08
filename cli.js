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
    argv = minimist(process.argv.slice(2));

if (argv.version) {
  console.log(pkg.version);
  process.exit();
}

if (argv.help) {
  console.log(readFile(__dirname, 'README.md'));
  process.exit();
}

var configFile = argv.config || ('.' + pkg.name + 'rc'),
    config = argv.noconf ? null : readJSON(configFile);

if (!config) {
  console.log('no configuration found: loading defaults');
}

var servers = isArrayLike(config) ? config : [ config ];

if (argv._.length) {
  servers = filter(servers, function (item) {
    var index = argv._.indexOf(item.name),
        match = index !== -1;

    if (match) { argv._.splice(index, 1); }
    return match;
  });

  each(argv._, function (item) {
    console.log('no server found:', item);
  });
}

each(servers, function (server) {
  fess(mix(server, argv));
});
