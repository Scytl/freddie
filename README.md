fess
====

Front end development server

Getting started
---------------

Launch the server from the document root of your project (where the `index.html`
is placed)

```sh
cd /path/to/prj
fess
```

>   server listening on port 3000

Now you can browse your web project with your preferred browser:

    http://localhost:3000

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

**fess** provides both a library to be used programatically and a CLI to be
used from the command-line

Install the CLI to be accessible from the command-line

```sh
[sudo] npm install -g fess
```

Or install the library from a project directory and save it as a development
dependency

```sh
cd /path/to/prj
npm install fess --save-dev
```

API
---

### fess(config?)

Launches a single fess server instance.

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

#### Multiple servers

You can launch multiple servers from the same script, each with its own
configuration

Simply call `fess()` several times passing the settings you want to each call

### config

The available config options are listed below

#### config.name

```js
name: 'foo'
```

**(String)** Name of the server to be used in logs

This is useful when launching several servers from the same script to
recognize which logs are emitted from which server

**(Defaults to)** `'server'`

#### config.root

```js
root: '/path/to/document/root'
```

**(String)** Path where the static files are placed

The server will only allow access to files inside this directory

The `/path/to/document/root` can be absolute or relative to the current
directory

**(Defaults to)** `process.cwd()` _(the current directory)_

#### config.port

```js
port: 3000
```

**(Number)** Port to listen for incoming requests

**fess** looks for a free port to listen. If the specified port is busy, the
port number is incremented and tried again until a free port is reached

**(Defaults to)** `3000`

CLI configuration
-----------------

**fess** looks inside the current directory (where the CLI is called from)
searching for a `.fessrc` JSON config file.

If there is no config file, the default static server is launched

### root

```json
{
    "root": "build"
}
```

The root is defined following this priority order:

1.  CLI parameter
2.  config's root property
3.  current directory

So, if a config file is defined and a CLI param is passed, the CLI param gets
priority over the config defined root

### proxy

A proxy table can be defined as follows:

```json
{
    "proxy": {
        "/api": "http://backend.com"
    }
}
```

This config causes all requests to `/api/...` to be redirected to
`http://backend.com/api/...`

A context can be specified in the target server:

```json
{
    "proxy": {
        "/api": "https://securebackend.com/foo"
    }
}
```

redirecting all `/api/...` requests to `https://securebackend.com/foo/api/...`

Multiple proxies can be defined by adding multiple rules to the `proxy`
property.

### port

```json
{
    "port": 3000
}
```

**fess** looks for a free port to listen. If the specified port is busy, the
port number is incremented and tried again until a free port is reached.

If no port is specified, the port search starts with the default `3000`

License
-------

The MIT License (MIT)
