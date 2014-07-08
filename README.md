fess
====

Front end development server

Getting started
---------------

Launch the server from the document root of your project (where the `index.html`
is placed)

    $ cd /path/to/prj
    $ fess

>   no configuration found: loading defaults

>   server listening on port 3000

Now you can browse your web project with your preferred browser:

    $ xdg-open http://localhost:3000

By default, **fess** acts as a static server, serving the files placed in the
directory from where it is launched

It has, however, 3 main features built-in, covering the full development cycle:

*   **static server** for serving the assets
*   **mock server** for prototyping when the back end is not released yet
*   **proxy server** for redirecting requests to a back end

That way you can configure your project ready for production, moving the
environment configuration out of the project's source

Install
-------

**fess** provides both a library to be used programatically and a command-line
utility

Install the CLI to be accessible from your shell

    $ [sudo] npm install -g fess

Or install the library from a project directory and save it as a development
dependency

    $ cd /path/to/prj
    $ npm install fess --save-dev

**NOTE:** For [grunt][1] users there is also a [grunt-fess][2] plugin available

CLI
---

    $ fess [server, ...] [options]

**fess** looks inside the current directory (where the CLI is called from)
searching for a `.fessrc` JSON config file.

If there is no config file, the default static server is launched

### [server, ...]

    $ fess dev doc

>   dev listening on port 3000

>   doc listening on port 3001

List of named servers to run.

The names must match the ones in the config file

### [options]

#### --help

    $ fess --help

Shows this document in the standard output

#### --version

    $ fess --version

>   0.2.2

Shows the version installed

#### --config

    $ fess --config /path/to/nondefault/config.json

Use the specified file as server configuration instead of the default `.fessrc`

#### --noconf

    $ fess --noconf

Ignore the `.fessrc` config file in the current directory

Useful when used with the server-related options like `--root`

### [server-related options]

The following options will be passed through directly to the **fess** library

For further information see the API documentation below

**Priority over config file**

The command-line options get priority over the config file options

When in a path with a `.fessrc` config file, running `fess` with server-related
options overrides the ones specified in the config file

If the config file has multiple servers, the command-line options will override
every server definition

In this particular cases, its useful the `--noconf` flag

#### --root

    $ fess --root /path/to/document/root

Path where the files you want to serve are stored

The root is defined following this priority order:

1.  CLI parameter
2.  config's root property
3.  current directory

#### --port

    $ fess --port 8080

Port to listen for incoming requests

You will need to use **sudo** to launch servers listening on **well known
ports** _(those below 1024)_

### .fessrc

**Single server configuration**

To configure a single server you can declare server-related options directly
as a JSON object

```json
{
  "root": "public",
  "port": 8080
}
```

The object will be passed through directly to the **fess** library

For a list of the options that can be used see the API documentation below

_(note that because of functions cannot be used in JSON, some options from
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
    "mock": {
      "/api": "mocks"
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

### fess(config?)

Launches a single server instance.

Optionally you can pass a config object to the `fess()` function to define
custom settings, otherwise defaults will be applied

Here is an example using the same config as the default settings

```js
var fess = require('fess');

fess({
  name: 'server',
  root: process.cwd(),
  port: 3000
});
```

Which is the same as calling `fess()` without any configuration object

```js
fess();
```

The defaults are merged with the config passed so you can configure just the
name, for instance, and the default port and root will be applied

```js
fess({ name: 'custom' });
```

is equivalent to

```js
fess({
  name: 'custom',
  root: process.cwd(),
  port: 3000
});
```

**Multiple servers**

You can launch multiple servers from the same script, each with its own
configuration

Simply call `fess()` several times passing the settings you want to each call

**Available middlewares**

There are 3 available middlewares built-in, which handles the requests with
the following priority order:

1.   proxy middleware
2.   mock middleware
3.   static middleware

If there is a proxy configuration defined and a request context matches one of
the contexts specified, the request is handled by the proxy middleware without
reaching any other middleware

If there is a mock configuration defined and a request context matches one of
the contexts specified (and the request has not been handled by the proxy
middleware), the request is handled by the mock middleware without reaching
any other middleware

If the request has not been handled by the previous middlewares it is handled
by the static middleware by default

If the static middleware cannot handle the request, an error HTTP response is
returned

**NOTE:** Even if you have defined mock and proxy configurations for the
same server just one of them (or none) will handle the request following
the priority order

#### config

The available config options are listed below

##### config.root

```js
root: '/path/to/document/root'
```

**(String)** Path where the static files are placed

The server will only allow access to files inside this directory

Usually this is the directory where `index.html` is placed

The path can be absolute or relative to the current directory

**(Defaults to)** `process.cwd()` _(the current directory)_

##### config.port

```js
port: 3000
```

**(Number)** Port to listen for incoming requests

**fess** looks for a free port to listen. If the specified port is busy, the
port number is incremented and tried again until a free port is reached

**(Defaults to)** `3000`

##### config.name

```js
name: 'foo'
```

**(String)** Name of the server to be used in logs

This is useful when launching several servers from the same script to
recognize which logs are emitted from which server

**(Defaults to)** `'server'`

##### config.mock

```js
mock: {
  '/api': '/path/to/mocks'
}
```

**({ context: path })** A map of request contexts to paths with mocked JSON
data

*   Having a JSON file with mock data stored in `/path/to/mocks/endpoint.json`
*   Having a mock configuration like in the sample above
    (`'/api': '/path/to/mocks'`)
*   All requests to `/api/endpoint` would be replied with the contents of the
    `endpoint.json` file

The path can be absolute or relative to the current directory

Multiple mappings can be defined here

**(Defatults to)** `undefined`

**NOTE:** JSON mocks are rendered using [dummy-json][3] which allows you to
generate random data from a handlebars extended JSON file

**URL params**

Currently there is no support for defining URLs with params

    /api/item/:id/data

If you need to mock requests like that you will need to create directories
representing the variable part (`:id`)

    /path/to/mocks/item/10/data.json
    /path/to/mocks/item/20/data.json

Then use the defined ids (`10`, `20`, ...) in your mocked data so the requests
can be matched against the mocked directory structure

**/path/to/mocks/items.json**

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

##### config.proxy

```js
proxy: {
  '/api': 'http://backend:8080/prj'
}
```

**({ context: url })** A map of request contexts to backend urls

*   Having a backend for the project hosted at `http://backend` listening
    to port `8080`
*   Having a proxy configuration like in the sample above
    (`'/api': 'http://backend:8080/prj'`)
*   All requests to `/api/endpoint` would be redirected to
    `http://backend:8080/prj/api/endpoint`
*   Support both `HTTP` and `HTTPS` protocols

Multiple mappings can be defined here

**(Defatults to)** `undefined`

##### config.onListen

```js
onListen: function (serverName, port) {
  console.log(serverName, 'listening on port', port);
}
```

**(function (serverName, port))** Called once the server starts listening

This is used by the [grunt-fess][2] plugin to release the async task

**(Defaults to)** `console.log` _(like in the sample above)_

License
-------

The MIT License (MIT)

[1]: https://github.com/gruntjs/grunt
[2]: https://github.com/Scytl/grunt-fess
[3]: https://github.com/webroo/dummy-json
