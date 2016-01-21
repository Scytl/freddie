freddie ![freddie](freddie.png)
===============================

Front end development server

Getting started
---------------

Launch the server from the document root of your project (where the `index.html`
is placed)

    $ cd /path/to/prj
    $ freddie

>   server listening on port 3000

Check your project at `http://localhost:3000`

Features
--------

By default, **freddie** acts as a static server, serving the files placed in
the directory from where it is launched

It has, however, 3 main features built-in, covering the full development cycle:

*   **static server** for static demos
*   **fixtures server** for prototyping when the back end is not released yet
*   **proxy server** for redirecting requests to a back end

Install
-------

    $ [sudo] npm install -g freddie

For [grunt][1] users there is a [grunt-freddie][2] plugin available

Usage
-----

    $ freddie [server, ...] [options]

**freddie** looks inside the current directory looking for a `.freddie.json`
config file.

If there is no config file, the default static server is launched

### [server, ...]

    $ freddie dev doc

>   dev listening on port 3000

>   doc listening on port 3001

List of named servers to launch.

Only names matching the ones in config file will be launched

### [options]

#### --help, -h

    $ freddie --help

Show documentation

#### --version, -v

    $ freddie --version

Show version

#### --config, -c

    $ freddie --config /path/to/nondefault/config.json

Use the specified file as server configuration instead of the default
`.freddie.json`

#### --noconf

    $ freddie --noconf

Ignore the `.freddie.json` config file in the current directory

Useful when used with the server-related options like `--root`

### [server-related options]

The following options will be passed through directly to the **freddie**
library

For further information see the API documentation below

**Priority over config file**

The command-line options get priority over the config file options

In a path with a `.freddie.json` file, running `freddie` with server-related
options overrides the ones specified in the config file

If the config file has multiple servers, the command-line options will override
every server definition

In this particular cases, its useful the `--noconf` flag

#### --root, -r

    $ freddie --root /path/to/document/root

Path where the files you want to serve are stored

The root is defined following this priority order:

1.  CLI parameter
2.  config's root property
3.  current directory

#### --port, -p

    $ freddie --port 8080

Port to listen for incoming requests

You will need to use **sudo** to launch servers listening on **well known
ports** _(those below 1024)_

### .freddie.json

**Single server configuration**

To configure a single server you can declare server-related options directly
as a JSON object

```json
{
  "root": "public",
  "port": 8080
}
```

The object will be passed through directly to the **freddie** library

For a list of the options that can be used see the API documentation below

_(note that because functions cannot be used in JSON, some options from
the API are just accessible through JavaScript)_

**Multiple server configuration**

To configure multiple servers simply use an array of single configurations

Its recommended to use the `name` option to recognize the servers in the
common log

```json
[
  {
    "name": "dev",
    "root": "build",
    "port": 4000,
    "fixtures": {
      "/api": "test/fixtures"
    }
  },
  {
    "name": "pre",
    "root": "bin",
    "port": 8080,
    "proxy": {
      "/api": "http://backend:4567/app"
    }
  },
  {
    "name": "doc",
    "root": "doc",
    "port": 5000
  }
]
```

API
---

### freddie(config?)

Launches a single server instance.

Optionally you can pass a config object to the `freddie()` function to define
custom settings, otherwise defaults will be applied

Here is an example using the same config as the default settings

```js
var freddie = require('freddie');

freddie({
  name: 'server',
  root: process.cwd(),
  port: 3000
});
```

Which is the same as calling `freddie()` without any configuration object

The defaults are merged with the config passed so you can configure just the
name, for instance, and the default port and root will be applied

**Multiple servers**

You can launch multiple servers from the same script, each with its own
configuration, by calling `freddie()` several times passing the settings you
want on each call

**Available middlewares**

There are 4 available middlewares built-in, which handles the requests with
the following priority order:

 1. proxy middleware
 2. fixtures middleware
 3. static middleware
 4. notfound middleware

The request handling is exclusive. If the 1st middleware (the proxy middleware)
can handle the request the other ones are not called at all. If the middleware
cannot handle the request, it is passed to the next middleware (the fixtures
middleware) and so on...

#### config.root

```js
root: '/path/to/document/root'
```

**(String)** Path where the static files are placed

The server will only allow access to files inside this directory

Usually this is the directory where `index.html` is placed

The path can be absolute or relative to the current directory

**(Defaults to)** `process.cwd()` _(the current directory)_

#### config.port

```js
port: 3000
```

**(Number)** Port to listen for incoming requests

**freddie** looks for a free port to listen. If the specified port is busy, the
port number is incremented and tried again until a free port is reached

**(Defaults to)** `3000`

#### config.name

```js
name: 'foo'
```

**(String)** Name of the server to be used in logs

This is useful when launching several servers from the same script to
recognize which logs are emitted from which server

**(Defaults to)** `'server'`

#### config.fixtures

```js
fixtures: {
  '/api': '/path/to/fixtures'
}
```

**({ context: path })** A map of request contexts to paths with JSON fixtures

The path can be absolute or relative to the current directory

Multiple mappings can be defined here

This middleware reply to every request that matches the specified
context regardless of the HTTP method used (`GET`, `POST`, ...)

The request is modified adding a `.json` at the end

*   Having a `/path/to/fixtures/endpoint.json` fixture
*   Having a `fixtures: { '/api': '/path/to/fixtures' }` configuration
*   All requests to `/api/endpoint` would be replied with the contents of
    `endpoint.json`

**(Defatults to)** `undefined`

**Comments**

Fixtures are parsed with [json-strip-comments][3] which allows to add c-like
comments in the json

**Random content**

Fixtures are rendered using [dummy-json][4] which allows to generate
random data from a handlebars extended JSON file

**Resonse configuration**

By default, freddie will treat the json contents as response data

```json
{
  "foo": 123
}
```

But you can wrap the previous response in a `body` attribute:

```json
{
  "body": {
    "foo": 123
  }
}
```

By doing so you can specify response metadata such as status code or headers

```json
{
  "headers": {
    "Access-Control-Allow-Origin": "*"
  },
  "body": {
    "foo": 123
  }
}
```

The following properties can be specified

  * `status`: HTTP response status code. Defaults to `200`
  * `headers`: HTTP response headers. Defaults to `{ 'Content-Type': 'application/json' }`
  * `latency`: Delay in milisecons before sending the response. Defaults to `0`


**URL params**

Currently there is no support for defining URLs with params

    /api/item/:id/data

For this kind of requests we have to use directories representing the variable
part (`:id`)

    /path/to/fixtures/item/10/data.json
    /path/to/fixtures/item/20/data.json

Then use the defined ids (`10`, `20`, ...) in your fixtures so future requests
can be matched against the fake directory structure

```json
[
  {
    "id": 10,
    "name": "foo"
  },
  {
    "id": 20,
    "name": "bar"
  }
]
```

#### config.proxy

```js
proxy: {
  '/api': 'http://backend:8080/prj'
}
```

Multiple mappings can be defined here

All requests to `/api/endpoint` would be redirected to
`http://backend:8080/prj/endpoint`

**({ context: url })** A map of request contexts to backend urls
*   Support both `HTTP` and `HTTPS` protocols

**(Defatults to)** `undefined`

#### config.notfound

`notfound` middleware settings

It can be used to define a custom `404` error page

```js
notfound: {
  path: 'file.html',
  status: 404
}
```

`status` defaults to `404`

```js
notfound: { path: 'file.html' }
```

It can also be useful while serving angular applications with `html5mode` enabled

```js
root: 'build',
notfound: {
  path: 'build/index.html',
  status: 200
}
```

**(Defatults to)** `undefined`

#### config.onListen

```js
onListen: function (serverName, port) {
  console.log(serverName, 'listening on port', port);
}
```

**(function (serverName, port))** Called once the server starts listening

This is used by the [grunt-freddie][2] plugin to release the async task

**(Defaults to)** `console.log` _(like in the sample above)_

License
-------

The MIT License (MIT)

[1]: https://github.com/gruntjs/grunt
[2]: https://github.com/Scytl/grunt-freddie
[3]: https://github.com/sindresorhus/strip-json-comments
[4]: https://github.com/webroo/dummy-json
