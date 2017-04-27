# Change Log

## [Unreleased]
* Changed `/list/` route to `/overview/`
* Reorganized and renamed component source files
* Removed verbose logging from `HistoryEra`
* Check existing feed items against new download rules
* Switch URL and Label textboxes in Add Feed form to match the Download Rules form

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

[Unreleased]:https://github.com/jfurrow/flood/compare/v1.0.0...HEAD
[1.0.0]:https://github.com/jfurrow/flood/compare/ae520c0a33ffb4ae6f21e47bc6f7e6007dd1e6dc...v1.0.0
