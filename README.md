# Flood
Flood is another web interface for [rtorrent](https://github.com/rakshasa/rtorrent). It implements a Node.js server for communicating with the rTorrent API, storing historical data, and serving the web UI.

It's a work-in-progress, and it might not have all of the features you want (yet). However, new features are added frequently. Feel free to file an issue and I'll try to prioritize your feature requests.

# Usage
#### Pre-Requisites
1. [rTorrent](https://github.com/rakshasa/rtorrent) needs to be installed __with XMLRPC__ configuration. _If you are currently using a web UI for rTorrent, you've already done this._
  * On OS X, [brew](http://brew.sh/) makes it simple. After [installing brew](http://brew.sh/), just run `brew install rtorrent --with-xmlrpc-c`.
  * For Linux, there are plenty of guides available. [Here's one](https://terminal28.com/how-to-install-and-configure-rutorrent-rtorrent-libtorrent-xmlrpc-screen-debian-7-wheezy/#4_Install_XMLRPC).
  * For Windows, try [this guide](https://rtwi.jmk.hu/wiki/rTorrentOnWindows) (I haven't tested this, let me know if you have problems).
2. Install NodeJS version `4.x`:
  * I recommend managing different Node versions with [nvm](https://github.com/creationix/nvm) or [n](https://github.com/tj/n).

#### Configuration
1. Set your rTorrent SCGI hostname and port in `config.js`. Defaults are `localhost` and `5000`.
  * If you want to use a socket, change `socket` to true and set `socketPath` to the absolute file path of your rTorrent socket, make sure Flood has read/write access.
2. Create a long, unique secret (used by bcrypt to hash passwords) in `config.js`.

#### Start It
1. Run `npm start` in your terminal at this repo's root.
  * On first run, this may take a few minutes while it installs dependencies and transpiles JavaScript & CSS assets.
2. Access the UI in your browser at `localhost:3000`.
  * To change the default port, run `npm start localhost {port}`.

#### Updating
1. To update, simply `git pull` in this repository's directory, then kill the running server (generally `ctrl+c`) and restart it with `npm start`.
  * The `start` script removes old dependencies, installs new ones, transpiles JavaScript and CSS, and starts the web server.

#### Tips
* I run the web server with `screen` to keep the web server running independently of the terminal session.
* Ubuntu users will need to install `nodejs-legacy` (`sudo apt-get install nodejs-legacy`) for dependencies to install successfully. You can read more on [this Stack Overflow post](http://stackoverflow.com/questions/21168141/cannot-install-packages-using-node-package-manager-in-ubuntu).

# Screenshots
![](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-a-0606.png)
![](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-b-0606.png)
![](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-c-0606.png)
![](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-d-0606.png)
![](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-e-0606.png)
![](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-f-0606.png)
