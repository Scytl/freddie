#!/usr/bin/env node

var minimist = require('minimist'),
    rc = require('rc');

var readFile = require('./util/readFile'),
    readJSON = require('./util/readJSON'),
    fess = require('./fess');

var defaults = {
  root: process.cwd(),
  port: 3000
};

var prj = readJSON(__dirname, 'package.json'),
    argv = minimist(process.argv.slice(2));

if (argv.version) {
  console.log(prj.version);
  process.exit();
}

if (argv.help) {
  console.log(readFile(__dirname, 'README.md'));
  process.exit();
}

var config = rc(prj.name, defaults, argv);

fess(config);
