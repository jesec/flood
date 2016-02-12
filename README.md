# Flood
Flood is a new web interface for rTorrent. It's a work-in-progress, and new features are added weekly by order of usefulness. If your definition of usefulness is different than mine, feel free to file an issue and I'll prioritize your request.

### Torrent List View
![Torrent list view](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-a.png)
### Sorting Torrents Dropdown
![Sorting torrents dropdown](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-b.png)
### Speed Limits Dropdown
![Speed limits dropdown](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-c.png)
### Add Torrents Modal
![Add torrents: single torrents](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-d.png)
![Add torrents: multiple torrents](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-e.png)
### Torrent Removal Confirmation
![Torrent removal confirmation](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-f.png)
### Torrent Details View
![Torrent details view](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-g.png)
![Torrent details view](https://s3.amazonaws.com/johnfurrow.com/share/flood-screenshot-h.png)

# How to Use
* Add your SCGI host and port in `config.js`. Defaults are `localhost` and `5000`.
* Copy `server/db/users.js.example` to `server/db/users.js` and add a username and password. This is stored in plain text for now, but is not accessible publicly.
* Install the dependencies:
  * Requires Node `4.x`. I recommend managing node versions with [nvm](https://github.com/creationix/nvm) or [n](https://github.com/tj/n).
  * Run `npm install` in your terminal at the repo's root.    
* Run the server by running `npm start` in your terminal at the repo's root.
