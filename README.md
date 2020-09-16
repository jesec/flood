# Flood

![Flood logo](flood.png)

[![Github Actions build status badge](https://github.com/jesec/flood/workflows/Build/badge.svg?branch=master&event=push)](https://github.com/jesec/flood/actions) [![Crowdin](https://badges.crowdin.net/flood/localized.svg)](https://crowdin.com/project/flood) [![Discord server badge](https://img.shields.io/discord/418267176873623553.svg?style=flat-square)](https://discord.gg/Z7yR5Uf)

Flood is a monitoring service for [rTorrent](https://github.com/rakshasa/rtorrent). It's a Node.js service that communicates with rTorrent instances and serves a decent web UI for administration. It's a work-in-progress.

#### Feedback

If you have a specific issue or bug, please file a [GitHub issue](https://github.com/jesec/flood/issues). Please join the [Flood Discord server](https://discord.gg/Z7yR5Uf) to discuss feature requests and implementation details.

#### More information

Check out the [Wiki](https://github.com/jesec/flood/wiki) for more information.

# Getting started

### Pre-Requisites

1. [rTorrent](https://github.com/rakshasa/rtorrent) needs to be installed and running **with XMLRPC** configuration.
   - For Linux & OS X, check out [rTorrent's installation wiki](https://github.com/rakshasa/rtorrent/wiki/Installing#compilation-help) and/or [this third-party tutorial](https://jes.sc/kb/rTorrent+ruTorrent-Seedbox-Guide.php#Install-Dependencies). When you run `./configure`, be sure to run with the `--with-xmlrpc-c` flag.
   - For Windows, try [this guide](https://rtwi.jmk.hu/wiki/rTorrentOnWindows).
2. Install [NodeJS](https://nodejs.org/) version `Current` (you might want to manage different Node versions with [nodenv](https://github.com/nodenv/nodenv) or [nvm](https://github.com/creationix/nvm) or [n](https://github.com/tj/n)). Flood tracks latest NodeJS release and does NOT provide support to legacy NodeJS versions.
3. Install `node-gyp` pre-requisites, see https://www.npmjs.com/package/node-gyp#installation, ex: `python`, `make`, `gcc`.

### Configuration

By default, Flood uses a command line configuration interface. If you installed Flood via `npm`, you should be able to use `flood` or `npx flood` to launch Flood. If you compile Flood from source, you will be able to use `npm run start` to execute Flood.

Run `flood --help`, `npx flood --help` or `npm run start -- --help` to get help about command line arguments.

If you want to know more about configurations, check `config.template.js`.

If static configuration is preferred, copy `config.template.js` to `config.js` and edit it.

When Flood's builtin user management is enabled (default), you will be prompted to configure the connection to rTorrent when loading the web interface.

**What to configure**

1. Be sure to create a long and unique secret (used to sign [JWT auth tokens](https://github.com/auth0/node-jsonwebtoken)).
2. If you are proxying requests to Flood from your own web server, configure Flood's path from the host at the `--baseuri` (or `baseURI`) property. All requests will be prefixed with this value.
   - For example, if serving Flood from `https://foo.bar/apps/flood`, you would set `baseURI` to `/apps/flood`. If serving flood from `https://foo.bar`, you do not need to configure `baseURI`.
   - [Read more about proxying requests to Flood on the Wiki](https://github.com/Flood-UI/flood/wiki/Using-Flood-behind-a-reverse-proxy), this is a common pain-point for users.

### Compiling assets and starting the server

From the root of the Flood directory...

1. Run `npm install` if you haven't already or if you've pulled changes.
2. Run `npm run build`.
3. Run `npm start`.

Access the UI in your browser. With default settings, go to `http://localhost:3000`. You can configure the port via `--port` argument.

### Updating

I've been bad about cutting actual releases, so check this repo for recent commits.

1. To update, run `git pull` in this repository's directory.
1. Check `config.template.js` for configuration changes that you may wish to incorporate in your `config.js`.
1. Kill the currently running Flood server.
1. Run `npm install` to update dependencies.
1. Run `npm run build` to transpile and bundle static assets.
1. Start the Flood server with `npm start`.

### Troubleshooting

- When you use `npm run start` to execute Flood, you have to pass command line arguments after `--`. For example, `npm run start -- --host 0.0.0.0 --port 8080`.
- Debian, Ubuntu and RHEL-based distributions users can install latest `nodejs` from [NodeSource](https://github.com/nodesource/distributions).
- Ask for help in the [Flood Discord server](https://discord.gg/Z7yR5Uf).

### Local Development

1. Run `npm install`.
2. Run `npm run start:development:server` and `npm run start:development:client` in separate terminal instances.
   - `npm run start:development:server` uses [nodemon](https://github.com/remy/nodemon) to watch for changes to the server-side JavaScript.
   - `npm run start:development:client` watches for changes in the client-side source.
3. Access the UI in your browser. Defaults to `localhost:4200`.

### Environment Variables

1. `DEV_SERVER_PORT`: webpackDevServer's port, used when developing Flood. Defaults to `4200`.
1. `DEV_SERVER_HOST`: webpackDevServer's host, used when developing Flood. Defaults to `0.0.0.0`.
1. `DEV_SERVER_HTTPS`: webpackDevServer's protocol, used when developing Flood. Defaults to `http`.

### Running with Docker

1. `uuidgen > flood.secret`
2. `docker build -t rtorrent-flood .`
3. `` docker run --name rtorrent-flood -e FLOOD_SECRET=`cat flood.secret` -p 3000:3000 rtorrent-flood ``
4. Other supported environment variables:
   - `FLOOD_BASE_URI`
   - `FLOOD_ENABLE_SSL`
   - `FLOOD_DISABLE_AUTH`
     - `RTORRENT_SCGI_HOST`
     - `RTORRENT_SCGI_PORT`
     - `RTORRENT_SOCK=true` + `RTORRENT_SOCK_PATH`

The docker container includes a volume at `/data`, which is where the database will be located. Additionally, you can place your SSL files there, `/data/flood_ssl.key` and `/data/flood_ssl.cert`. Set `FLOOD_ENABLE_SSL` to `true` to enable their use if present. Additionally, a local rtorrent socket file located at `/data/rtorrent.sock` can be used if `RTORRENT_SOCK` is set to `true`. The location of the socket file can be overrided by setting `RTORRENT_SOCK_PATH` to the path of the socket.
