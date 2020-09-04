# Change Log

## [3.1.0] (September 4, 2020)
* Allow to replace main tracker of torrents
* Allow adjustment of visible context menu items
* config.cli: make all configs configurable by options and env
* styles: properly set width of clipboard icon (fixes #26)
* client: hide logout button when auth is disabled
* Hungarian support (#21), thanks to @sfu420
* New translations:
  * Chinese Traditional, thanks to @vongola12324
  * Czech, thanks to @brezina.jn
  * Portuguese, thanks to @Zamalor
* Security enhancements:
  * Allow restriction on file operations by paths
  * Do not bypass authentication token validation with disableUsersAndAuth
  * server: prohibit Cross-Origin Resource Sharing
  * server: auth: strictly prohibit cross-site cookie
* Minor security fixes:
  * rTorrentDeserializer: avoid double unescaping
  * SettingsModal: mergeObjects: prevent prototype pollution
  * server: setSettings: turn inboundTransformations into a Map to validate dynamic call
  * server: be explicit about client app routes
  * server: cache index.html into memory
* Minor refactoring and other changes
* Bump dependencies to the latest revisions

## [3.0.0] (August 25, 2020)
* BREAKING CHANGES:
  * If `baseURI` is set, server will only respond to requests with baseURI. For instance, if you use `location /flood {proxy_pass http://127.0.0.1:3000;}`, you would have to change it to `location /flood {proxy_pass http://127.0.0.1:3000/flood;}`.
  * Static assets now use relative paths only. It is no longer needed to recompile after `baseURI` change.
  * Location of runtime files are rearranged. New default location for runtime files is `./run` folder. `tempPath` is now made configurable.
  * Static assets are relocated to `./dist` folder. You have to change the path from `./server/assets` to `./dist/assets` if you serve static assets from web server.
  * Flood will refuse to start if secrets are detected in static assets. Former default secret `flood` and some other weak secrets are no longer accepted.
* A command line interface is added as `config.cli.js`. Rename it to `config.js` and run `npm run start -- --help` for more details.
* With some changes, Flood is now ready for publish to `npm`. You can now use `sudo npm install -g flood` to get a ready-to-use copy of Flood, then run `flood`. It is even easier with `npx`, try `npx flood --help` now.
* Better localization:
  * Flood project is now integrated with [Crowdin](https://crwd.in/flood), a renowned translation management system. It is now easier than ever to contribute your translations to Flood.
  * Language will now be automatically detected from your browser by default.
  * New languages are supported: `Čeština`, `Deutsch`, `italiano`, `norsk`, `Polskie`, `русский язык`, `Romanian`, `svenska`, `українська мова`, `日本語` and `اَلْعَرَبِيَّةُ` thanks to `Crowdin Machine Translation`.
  * New translations for `Chinese (Traditional)` thanks to @vongola12324.
  * New translations for `Dutch` thanks to @NLxDoDge.
  * New translations for `Portuguese` thanks to @MiguelNdeCarvalho.
* Support for touch and smaller screen devices:
  * Sidebar is able to be collapsed via a button. It is collapsed by default when screen width is lower than `720px`.
  * Modals (Settings, Torrent Details, Add Torrent, etc.) are tuned for smaller screen devices.
  * It is now possible to open context (right click) menu on iOS/Safari devices by long pressing the item.
  * Drag and drop is now possible for touch devices. You can now adjust the order of columns in Settings on touch devices.
  * Widths of columns are now adjustable on touch devices. (condensed view)
* Dark color scheme support:
  * Flood now automatically switches between light and dark color scheme based on your system settings.
* XML special chars (`&`, `<`, `>`, `'`, `"`) are properly handled. For instance, escaped chars like `&` will be properly displayed as `&` instead of `&amp;`. File operations on torrent with special chars no longer fail.
* `squashfs` and `tmpfs` mount points are now excluded by default in disk usage. This hopefully makes sure that useless system mounts won't spam the list.
* `More Info` button in expanded view is removed.
* More dependencies are bumped to the latest revisions.

## [2.0.0] (August 5, 2020)
* BREAKING CHANGES:
  * Bump dependencies to the latest version if possible
  * Node 12 or later is now required
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
* Simplify peer geo flag handling
  * Flag images now serves as static asset
* moveTorrents: Allow hash check to be skipped by user
* Add an option to completely disable users and authentication
* server: Takes baseURI into account for routes and assets
* torrentListPropMap: use d.hashing= instead of d.is_hash_checking=
  * Torrents queued for checking are now shown
* sidebar: Add Checking filter view

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
[2.0.0]:https://github.com/jesec/flood/compare/v1.0.0...v2.0.0
[3.0.0]:https://github.com/jesec/flood/compare/v2.0.0...v3.0.0
[3.1.0]:https://github.com/jesec/flood/compare/v3.0.0...v3.1.0
