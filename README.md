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

Launch a basic static server

1.  Go to the root directory of the site you want to serve (a directory with
    an `index.html`)

    ```sh
    cd /path/to/my-prj
    ```

2.  From the command line, launch the fess CLI

    ```sh
    fess
    ```

Alternatively, you can launch the server from any directory passing the root
path as the first param

```sh
fess /path/to/my-prj
```

The root directory can be passed as absolute path or relative to the current
directory

**DEPRECATION WARNING:** As soon as the CLI params get implemented, passing a
root directory by param will be done through the `--root` flag

```sh
fess --root /path/to/my-prj
```

Config file
-----------

**fess** looks inside the current directory (where the CLI is called from)
searching for a `.fess.json` config file.

If the config file is found it is loaded, otherwise **fess** launches a simple
static server

### root

In the config file, you can configure your root directory, so having a config
file like the following:

```json
{
    "root": "build"
}
```

and calling **fess** from the same directory as the config file, causes the same
behavior as calling directly

```sh
fess build
```

The root is defined following this priority order:

1.  CLI parameter
2.  config's root property
3.  current directory

so, if both, a config file is defined and a CLI param is passed, the CLI param
gets priority over the config defined root

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

Either **http** and **https** protocols are supported.

A context can be specified in the target server:

```json
{
    "proxy": {
        "/api": "https://backend.com/foo"
    }
}
```

redirecting all `/api/...` requests to `http://backend.com/foo/api/...`

Multiple proxies can be defined by adding multiple rules to the **proxy**
property.
