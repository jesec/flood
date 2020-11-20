# Flood

[![Flood logo](https://github.com/jesec/flood/raw/master/flood.svg)](https://flood.js.org)

[![Github Actions build status badge](https://github.com/jesec/flood/workflows/Build/badge.svg?branch=master&event=push)](https://github.com/jesec/flood/actions) [![Crowdin](https://badges.crowdin.net/flood/localized.svg)](https://crowdin.com/project/flood) [![Discord server badge](https://img.shields.io/discord/418267176873623553.svg?style=flat-square)](https://discord.gg/Z7yR5Uf)

Flood is a monitoring service for various torrent clients. It's a Node.js service that communicates with your favorite torrent client and serves a decent web UI for administration. This project is based on the [original Flood project](https://github.com/Flood-UI/flood).

#### Supported Clients

| Client                                                          | Support                              |
| --------------------------------------------------------------- | ------------------------------------ |
| [rTorrent](https://github.com/rakshasa/rtorrent)                | Stable and Tested :white_check_mark: |
| [qBittorrent](https://github.com/qbittorrent/qBittorrent) v4.1+ | Experimental :alembic:               |
| [Transmission](https://github.com/transmission/transmission)    | Experimental :alembic:               |

#### Feedback

If you have a specific issue or bug, please file a [GitHub issue](https://github.com/jesec/flood/issues). Please join the [Flood Discord server](https://discord.gg/Z7yR5Uf) to discuss feature requests and implementation details.

#### More Information

Check out the [Wiki](https://github.com/jesec/flood/wiki) for more information.

# Getting started

### Pre-Requisites

Install [Node.js runtime](https://nodejs.org/). Flood tracks `Current` and provides support to `Active LTS` as well.

- Debian, Ubuntu and RHEL-based distributions users can install latest `nodejs` from [NodeSource](https://github.com/nodesource/distributions) software repository.
- Windows and MacOS users may use installer.

**EXPERIMENTAL**: You can download a single-executable build from [Releases](https://github.com/jesec/flood/releases) (or rolling build from [Actions](https://github.com/jesec/flood/actions?query=workflow%3A%22Publish+rolling+build%22)). It bundles `Node.js` and supports `Linux`, `MacOS` and `Windows`.

### Installation

`sudo npm i -g flood` or `npx flood`

Or use `@jesec/flood` for cutting-edge builds.

Or [build from source](https://github.com/jesec/flood#Building-Flood).

### Run

`flood` or `npx flood` if you installed Flood via `npm`.

`npm run start` if you compiled Flood from source.

Check [Wiki](https://github.com/jesec/flood/wiki) for how to install Flood as a service.

### Configuration

Flood uses a command line configuration interface.

Run `flood --help`, `npx flood --help` or `npm run start -- --help` to get help about command line arguments.

If you want to know more about configurations, check [shared/schema/Config.ts](https://github.com/jesec/flood/blob/master/shared/schema/Config.ts).

When Flood's builtin user management is enabled (default), you will be prompted to configure the connection to torrent client when loading the web interface.

**What to configure**

1. If you are proxying requests to Flood from your own web server, configure Flood's path from the host at the `--baseuri` (or `baseURI`) property. All requests will be prefixed with this value.
   - For example, if serving Flood from `https://foo.bar/apps/flood`, you would set `baseURI` to `/apps/flood`. If serving flood from `https://foo.bar`, you do not need to configure `baseURI`.
   - Read more about proxying requests to Flood in the [Wiki](https://github.com/jesec/flood/wiki).
1. Check [Wiki](https://github.com/jesec/flood/wiki), especially `Security` sections.

### Upgrade

Run the installation command again.

### Troubleshooting

- Flood and filesystem:
  - Flood server performs file operations itself. As such, Flood needs to have permissions/access to the files.
  - Flood only uses the path provided by the torrent client so it needs to have the same filesystem context as the torrent client. If a file is "/path/to/a/file" to the torrent client, it has to be "/path/to/a/file" to Flood in order to get file operations working. It can't be "/mnt/some/different/path/file".
- rTorrent:
  - Linux or MacOS users can use package managers such as `apt`, `yum`, `pacman`, `brew` of the platform to install rTorrent.
  - Windows users can use [Cygwin](https://www.cygwin.com/) to install rTorrent.
  - [Compile](https://github.com/rakshasa/rtorrent/wiki/Installing): XMLRPC support flag (`--with-xmlrpc-c`) is required during compilation.
- Ask for help in the [Flood Discord server](https://discord.gg/Z7yR5Uf).

### Docker

`docker run -it jesec/flood --help`

Or `jesec/flood:master` for cutting-edge builds.

To upgrade, `docker pull jesec/flood`.

Note that you have to let Docker know which port should be exposed (e.g. `-p 3000:3000`) and folder mapping (e.g. `-v /data:/data`).

Don't forget to pay attention to `flood`'s arguments like `--port` and `--allowedpath`.

Currently Docker images of this project don't bundle a torrent client (yet). Its usefulness is limited as a result. You have to install a torrent client inside the container or make it possible for Flood inside Docker to interact with your torrent client.

Filesystem parts in [Troubleshooting](https://github.com/jesec/flood#troubleshooting) are especially important for containers.

## Building Flood

### Clone from repository

`git clone https://github.com/jesec/flood.git`

### Compiling assets and starting the server

From the root of the Flood directory...

1. Run `npm install`.
1. Run `npm run build`.
1. Run `npm start`.

Access the UI in your browser. With default settings, go to `http://localhost:3000`. You can configure the port via `--port` argument.

**Notes**

- When you use `npm run start` to execute Flood, you have to pass command line arguments after `--`. For example, `npm run start -- --host 0.0.0.0 --port 8080`. This applies to any `npm run` (e.g. `start:development:client`).

### Updating

1. To update, run `git pull` in this repository's directory.
1. Kill the currently running Flood server.
1. Run `npm install` to update dependencies.
1. Run `npm run build` to transpile and bundle static assets.
1. Start the Flood server with `npm start`.

### Local Development

1. Run `npm install`.
1. Run `npm run start:development:server` and `npm run start:development:client` in separate terminal instances.
   - `npm run start:development:server` uses [ts-node-dev](https://www.npmjs.com/package/ts-node-dev) to watch for changes to the server-side source. Or open the folder with VS code and then `Run -> Start Debugging`. You may use a [Javascript IDE](https://code.visualstudio.com/) to debug server codes.
   - `npm run start:development:client` watches for changes in the client-side source. Access the UI in your browser. Defaults to `localhost:4200`. You may use browser's [DevTools](https://developers.google.com/web/tools/chrome-devtools) to debug client codes.

`--help --show-hidden` shows advanced arguments.

`--proxy` proxies requests from a development client to a URL of your choice (usually URL to a Flood server). It is useful when you wish to do development on the frontend but not the backend. Or when the frontend and backend are being developed on different hosts.

### Environment Variables

1. `DEV_SERVER_PORT`: webpackDevServer's port, used when developing Flood. Defaults to `4200`.
1. `DEV_SERVER_HOST`: webpackDevServer's host, used when developing Flood. Defaults to `0.0.0.0`.
1. `DEV_SERVER_HTTPS`: webpackDevServer's protocol, used when developing Flood. Defaults to `http`.

### Building Docker

1. `docker build --pull --rm -f Dockerfile -t flood:latest .`
1. `docker run -it flood --help`
