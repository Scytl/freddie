#!/usr/bin/env node

var rc = require('rc');

var readJSON = require('./util/readJSON'),
    fess = require('./fess');

var defaults = {
    root: process.cwd(),
    port: 3000
};

var prj = readJSON(__dirname, 'package.json'),
    config = rc(prj.name, defaults);

if (config.version) {
    console.log(prj.version);
    process.exit();
}

fess(config);
