# Flood

![Flood logo](flood.png)

[![Travis CI build status badge](https://img.shields.io/travis/jfurrow/flood/master.svg?style=flat-square)](https://travis-ci.org/jfurrow/flood) [![Discord server badge](https://img.shields.io/discord/418267176873623553.svg?style=flat-square)](https://discord.gg/Z7yR5Uf)

Flood is another web interface for [rtorrent](https://github.com/rakshasa/rtorrent). It implements a Node.js server for communicating with the rTorrent API, storing historical data, and serving the web UI.

It's a work-in-progress, and it might not have all of the features you want (yet). However, new features are added frequently. Feel free to file an issue and I'll try to prioritize your feature requests.

#### Feedback

If you have a specific issue or bug, please file a Github issue. If you want to participate in discussions about Flood's future, please join the [Flood Discord server](https://discord.gg/Z7yR5Uf).

# Usage

#### Pre-Requisites

1. [rTorrent](https://github.com/rakshasa/rtorrent) needs to be installed __with XMLRPC__ configuration. _If you are currently using a web UI for rTorrent, you've already done this._
  * For Linux & OS X, check out [rTorrent's installation wiki](https://github.com/rakshasa/rtorrent/wiki/Installing#compilation-help) and/or [this third-party tutorial](https://jes.sc/kb/rTorrent+ruTorrent-Seedbox-Guide.php#Install-Dependencies). When you run `./configure`, be sure to run with the `--with-xmlrpc-c` flag.
  * For Windows, try [this guide](https://rtwi.jmk.hu/wiki/rTorrentOnWindows) (I haven't tested this, let me know if you have problems).
2. Install NodeJS version `8` or higher (you might want to manage different Node versions with [nvm](https://github.com/creationix/nvm) or [n](https://github.com/tj/n)).
3. Since #523 [node-gyp](https://www.npmjs.com/package/node-gyp) is needed.
  * `sudo npm install -g node-gyp`
  * Check you match node-gyp [dependencies](https://github.com/nodejs/node-gyp#installation) (ex: gcc, make, python2).

#### Configuring

1. Copy `config.template.js` to `config.js`. This is required.
2. Set your rTorrent SCGI hostname and port in `config.js`. Defaults are `localhost` and `5000`.
  * If you want to use a socket, change `socket` to true and set `socketPath` to the absolute file path of your rTorrent socket. Make sure Flood has read/write access. Specify the socket path in `.rtorrent.rc`. Example: `scgi_local = /Users/flood/rtorrent.sock`
  * If you wish to access an rTorrent instance running on a separate host from Flood (or in a Docker container), allow for incoming connections from external IPs by setting the host in `scgi_port` to `0.0.0.0` in `.rtorrent.rc`. Example: `scgi_port = 0.0.0.0:5000`
3. Create a long, unique secret (used to sign [JWT auth tokens](https://github.com/auth0/node-jsonwebtoken)) in `config.js`.
4. If you're proxying Flood to a path other than the root of the host, you must specify the `baseURI` in `config.js`. All request URIs will be prefixed with this value.
  * For example, if hosting Flood from `https://foo.bar/apps/flood`, you would set `baseURI` to `/apps/flood`. If hosting flood from `https://foo.bar`, you do not need to configure `baseURI`.

**Note**: each time you modify `baseURI` in `config.js` you need to recompile assets (`npm run build`). To be sure follow the *Updating* procedure each time you modify the `config.js` file.

#### Compiling assets and starting the server

1. Run `npm install`.
  * Note: Since #523 [node-gyp](https://www.npmjs.com/package/node-gyp) is needed. **IF** you need `sudo`, use `sudo npm i --unsafe-perm` (see [here](https://github.com/nodejs/node-gyp/issues/454) for why `--unsafe-perm`) else installation will fail. If you dont need sudo just use `npm i` as usual.
  * If your system use python3 as default you will need to install python2 and use `npm i --python="/usr/bin/python2"`.
2. Run `npm run build`.
3. Run `npm start`.
4. Access the UI in your browser. Defaults to `localhost:3000`.
  * You may change the default port in `config.js`.
5. Upon loading the UI the first time, you will be prompted to create a user account.

#### Updating

1. To update, run `git pull` in this repository's directory.
1. Check `config.template.js` for configuration changes that you may wish to incoporate in your `config.js`.
1. Kill the running Node server.
1. Run `npm install` to update dependencies.
1. Run `npm run build` to transpile and bundle static assets.
1. Restart it with `npm start`.

#### Tips

* I run the web server with `screen` to keep the web server running independently of the terminal session.
* Ubuntu users may need to install `nodejs-legacy` (`sudo apt-get install nodejs-legacy`) for dependencies to install successfully. You can read more on [this Stack Overflow post](http://stackoverflow.com/questions/21168141/cannot-install-packages-using-node-package-manager-in-ubuntu).

#### Local Development

1. Run `npm install`.
2. Run `npm run start:development:server` and `npm run start:development:client` in separate terminal instances.
  * `npm run start:development:server` uses [nodemon](https://github.com/remy/nodemon) to watch for changes to the server-side JavaScript.
  * `npm run start:development:client` watches for changes in the client-side source.
3. Access the UI through the [WebpackDevServer](https://webpack.js.org/configuration/dev-server/). It expects to proxy requests to the Flood server you have running, defined in `config.js` as `floodServerProxy`.
4. Build the documentation `npm run build-docs`.

#### Environment Variables

1. `DEV_SERVER_PORT`: webpackDevServer's port, used when developing Flood. Defaults to `4200`.
1. `DEV_SERVER_HOST`: webpackDevServer's host, used when developing Flood. Defaults to `0.0.0.0`.
1. `DEV_SERVER_HTTPS`: webpackDevServer's protocol, used when developing Flood. Defaults to `http`.

#### Running with Docker

1. `docker build -t rtorrent-flood .`
2. `docker run --name rtorrent-flood -e RTORRENT_SCGI_HOST=w.x.y.z -p 3000:3000 rtorrent-flood`
3. Other supported environment variables:
  * `FLOOD_BASE_URI`
  * `FLOOD_SECRET`
  * `RTORRENT_SCGI_HOST`
  * `RTORRENT_SCGI_PORT`
  * `RTORRENT_SOCK`
  * `FLOOD_ENABLE_SSL`

The docker container includes a volume at `/data`, which is where the database will be located.  Additionally, you can place your SSL files there, `/data/flood_ssl.key` and `/data/flood_ssl.cert`. Set `FLOOD_ENABLE_SSL` to `true` to enable their use if present. Additionally, a local rtorrent socket file located at `/data/rtorrent.sock` can be used if `RTORRENT_SOCK` is set to `true`.

## Notes

This project's client-side build tooling is based on the wonderful [create-react-app](https://github.com/facebookincubator/create-react-app).

# Screenshots

![](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshots-a.png)
![](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshots-b.png)
![](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshots-c.png)
![](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshots-d.png)
![](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshots-e.png)
![](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshots-f.png)
