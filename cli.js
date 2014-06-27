#!/usr/bin/env node

var minimist = require('minimist'),
    each     = require('./util/each'),
    mix      = require('./util/mix'),
    isArray  = require('./util/isArray'),
    readFile = require('./util/readFile'),
    readJSON = require('./util/readJSON'),
    fess     = require('./fess');

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
    config = readJSON(configFile);

if (!config) {
  console.log('no config found, loading defaults');
  config = {};
}

if (!isArray(config)) { config = [ config ] };

var defaults = {
  root: process.cwd(),
  port: 3000,
  name: 'server'
};

each(config, function (server) {
  fess(mix(defaults, server));
});
