# Change Log

## [Unreleased]
* Supports connecting to multiple rtorrent instances (one per user)
  * Moved rtorrent configuration to user database
  * Prompts user for connection details in UI when can't connect to rtorrent
* Changed `/list/` route to `/overview/`
* Reorganized and renamed component source files
* Removed verbose logging from `HistoryEra`
* Check existing feed items against new download rules
* Switch URL and Label textboxes in Add Feed form to match the Download Rules form
* Rate-limit the SCGI calls to rTorrent
  * Sends only one call at a time
  * Sends at most one call every 250 miliseconds
* Implement "actity stream"
  * The Flood client no longer polls the Flood server on an interval. Instead,
  the Flood server polls rTorrent on a more regular interval and emits changes
  via an event-stream. This significantly reduces data usage on the Flood client
  * Stream covers torrent list, transfer rate summary & history,
  torrent taxonomy, and notification count.
* Close event stream after the window/tab has been inactive for 30 seconds
* Refactor development experience, using `Webpack` & `WebpackDevServer`
* Require users to build static assets again

## [1.0.0] (April 21, 2017)
* First "official" release
* Change log and semver versioning (finally)
* Control basic rTorrent settings via web UI
  * Transfer rate limiting
  * Connection settings
  * Resource utilization
* Add torrents via URLs or files
* User authentication
* UI translations (only en, fr, and nl)
* Custom torrent tags
* Customizable torrent list
  * "Expanded" and "condensed" views
  * Customizable torrent detail columns
* Basic torrent list filtering (by status, tag, and tracker)
* Auto-download torrents from RSS feeds

[Unreleased]:https://github.com/Flood-UI/flood/compare/v1.0.0...HEAD
[1.0.0]:https://github.com/Flood-UI/flood/compare/ae520c0a33ffb4ae6f21e47bc6f7e6007dd1e6dc...v1.0.0
