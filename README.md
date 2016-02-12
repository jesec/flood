# Flood
Flood is another web interface for [rtorrent](https://github.com/rakshasa/rtorrent). It's intended to be both beautiful and functional.

It's heavily a work-in-progress, and it doesn't yet have all of the features that you're going to need. New features are added on a regular basis by order of usefulness. If your definition of usefulness is different than mine, feel free to file an issue and I'll prioritize your request.

# Usage
## Pre-Requisites
* [rTorrent](https://github.com/rakshasa/rtorrent) needs to be intalled with XMLRPC support.
  * On OS X, this can be done really easily with [brew](http://brew.sh/). You'd just run `brew install rtorrent --with-xmlrpc-c`.
  * For Linux distros, there are plenty of guides available. [Here's one](http://linoxide.com/ubuntu-how-to/setup-rtorrent-rutorrent/).
  * For Windows, try [this guide](https://rtwi.jmk.hu/wiki/rTorrentOnWindows) (I haven't tested this myself).
* Install the dependencies:
  * Use Node `4.x` (Node versions can be managed effortlessly with [nvm](https://github.com/creationix/nvm) or [n](https://github.com/tj/n)).
  * Run `npm install` in your terminal at the repo's root.

## Configuration
* Add your SCGI host and port in `config.js`. Defaults are `localhost` and `5000`.
* Copy `server/db/users.js.example` to `server/db/users.js` and add a username and password (password is stored in plain text for now, but this file is not accessible via the web server).

## Starting the Web Server
* Run `npm start` in your terminal at this repo's root.
* Access the UI in your browser at `localhost:3000`.
  * To change the default port, run `npm start localhost {port}`.

# Screenshots
#### Torrent List View
![Torrent list view](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-a.png)

#### Sorting Torrents Dropdown
![Sorting torrents dropdown](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-b.png)

#### Speed Limits Dropdown
![Speed limits dropdown](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-c.png)

#### Add Torrents Modal
![Add torrents: single torrents](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-d.png)
![Add torrents: multiple torrents](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-e.png)

#### Torrent Removal Confirmation
![Torrent removal confirmation](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-f.png)

#### Torrent Details View
![Torrent details view](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-g.png)
![Torrent details view](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-h.png)
