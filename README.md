fess
====

Front end development server

Launch the server from the document root of your project (where the `index.html`
is placed)

```sh
cd /path/to/prj
fess
```

>   server listening on port 3000

Now you are able to browse your web project from your preferred browser:

    http://localhost:3000

By default, **fess** acts as a static server, serving the files placed in the
directory from where it is launched

It has, however, 3 main features built-in, covering the full development cycle:

*   static server (for serving the assets)
*   mock server (for prototyping when the back end is not released yet)
*   proxy server (for redirecting requests to a back end)

That way you can configure your project ready for production, moving the
environment configuration out of the project

Install
-------

```sh
[sudo] npm install -g fess
```

Configuration
-------------

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
