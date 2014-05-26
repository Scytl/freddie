fess
====

Frontend static server

Install
-------

```sh
[sudo] npm install -g fess
```

Usage
-----

Launch a static server

1.  Go to the root directory of the site you want to serve (a directory with
    an `index.html`)

    ```sh
    cd /path/to/my-prj
    ```

2.  From the command line, launch the CLI

    ```sh
    fess
    ```

Alternatively, you can launch the server from any directory passing a root
path

```sh
fess --root /path/to/my-prj
```

The root directory can be passed as absolute path or relative to the current
directory

Config file
-----------

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
