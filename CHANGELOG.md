# Changelog

## [4.8.2] (May 4, 2024)

nothing new, just a new release to for deb files.

## [4.8.1] (May 4, 2024)

- feat: new args `--disable-rate-limit` to disable rate limit on api except login (#737)
- fix: only generate mediainfo for video file (#741)
- fix: `/metainfo` json response for error (#740)

## [4.8.0] (April 24, 2024)

- fix(client): filter empty tags when setting/submitting tags (#715)
- fix(client): modal overflow on mobile (#713)
- fix(server): content-type on responding html (#708)
- fix(client): allows modal to grow when inner width exceeds container (#597)
- fix(client): misc styles (#691)
- fix(server): `@fastify/express` doesn't work with http2 (#705)
- fix(client): tracker filter size conditional render logic and react key prop (#702)
- fix: log error trace (#697)
- fix(server): handle number port (#692)
- feat(client): detect magnet and torrent links from clipboard (#690)
- server: remove port requirement, permit running on paths (#680)
- perf: mediainfo router should use async/await to get file info (#656)
- feat: use relative path in mediainfo info (#657)
- TorrentGeneralInfo: drop leading and trailing whitespaces from comment (#674)
- LinkedText: fix torrent comment line break (#667)
- server: rTorrent: manage request queue with p-queue - fix memory leak (#650)
- TransferRateGraph: explicitly declare width and height to 100%
- server: qBittorrent: use POST method for API calls
- server: qBittorrent: log in using POST method (#594)
- server: torrentService: normalize case of hash during torrent lookup
- TorrentListColumns: add "Finished" column (#565)
- styles: sortable-list: disallow selecting text in a list
- client: scripts: development: drop unnecessary browser popup
- MoveTorrentsModal: suggest longest common prefix as path
- server: rTorrent: throw error when file moving fails
- FilesystemBrowser: line break unconditionally for long paths
- TorrentListDropzone: pop up "Add Torrents" modal instead of adding directly
- server: rTorrent: avoid relying on type coercion of RPC value
- server: rTorrent: remove "hasLoadThrow" and fold into "isJSONCapable"
- server: ditch unmaintained "spdy"
- SortableList: switch to clauderic/dnd-kit
- server: drop databases before removing user
- server: switch to @seald/nedb
- server: tests: replace "ts-jest/utils" with "ts-jest"
- TorrentGeneralInfo: display "None" when there is no comment
- LinkedText: drop RegEx incompatible with Safari
- feature: display comment inside .torrent in torrent details (#541)
- TransferRateGraph: fix blank graph in some cases
- TorrentList: fix "a wild 0 appears"
- client: Fix regression introduced in PR #519, fixes #522 (#523)
- sidebar: make filter sections collapsible (#519)
- client: add page title speed display preference
- DownloadRulesTab, FeedsTab: force new component when editing
- server: add shebang to bundled executable
- Dockerfile: use the "npm run build" command
- server: create production build with webpack directly
- server: flatten directory structure a bit
- server: tests: ensure connectivity to client before tests
- server: tests: confirm deletion of torrents before continue
- client: reformat "typings.d.ts", fixup ffcc5c8e0
- server: tests: mock response to torrents fetch
- server: normalize fetching of torrents added with URL
- client: fix webpack devServer port selection
- styles: apply dark theme to TorrentListDropzone
- TorrentFilterStore: simplify and fix scroll to top on filter change
- client: allow multi-select of filters with Ctrl and Shift keys
- server: remove unused history snapshots and make it in-mem only
- TagFilters, TrackerFilters: fix filtering by tag/tracker
- client: remove unnecessary "UIActions" abstraction
- server: Transmission: normalize "unknown" ETA (-2) to infinity (-1) (#432)

## [4.7.0] (October 9, 2021)

- Display total size by tag or tracker of torrents on sidebar (#369, @sabersalv)
- Improve memoization of "TorrentListRow" and "ProgressBar" components
- Fix loading indicator bar alignment (#396, @DopyConqueror)
- New translations
  - Arabic, thanks to yngams
  - Chinese Simplified, thanks to @davidxuang
  - Czech, thanks to @Kedlub
  - Italian, thanks to @GiorgioBrux
  - German, thanks to @Kiina
  - Japanese, thanks to @Kuri0421 and @Kiina
  - Korean, thanks to @Kiina
  - Polish, thanks to @retmas-gh
  - Spanish, thanks to @oaknuggins
  - Norwegian, thanks to Daddie0
- Bump dependencies

## [4.6.1] (July 5, 2021)

- DiskUsage: skip mount points of "overlayfs" type (#341, @Trim21)
- Deluge:
  - Avoid crashing Flood when there is a connection error
  - Note again that Deluge support is still experimental
- Bug fixes:
  - Cleanup synchronous patterns (#340)
  - AuthForm: add missing i18n for "Username" and "Password" (#336)
  - server: destroy user services before cleaning up data
  - TorrentListCell: passthrough clicks
- New translations
  - French, thanks to @foXaCe
  - German, thanks to @chint95
  - Korean, thanks to @Kiina
  - Romanian, thanks to @T-z3P
- Bump dependencies

## [4.6.0] (May 28, 2021)

- Experimental Deluge support
  - caveat: tags are not supported at the moment
- Add "last active date" and "finished date" to the torrent properties
- Migrate stylesheets to SCSS module system
- Ditch inefficient "TRANSFER_SUMMARY_DIFF_CHANGE" SSE event
- Allow to download contents of multiple selected torrents
- Update base Node.js versions of single-executable builds
- rTorrent:
  - Add torrents to rTorrent via socket
- qBittorrent:
  - Improve performance by throttling concurrent requests
- Bug fixes:
  - Fix memory leak and unreliability when the settings of a user is updated by simplifying service manager
  - Pipe created torrent to response directly
- Security enhancements:
  - Forbid non-owner access to runtime directory by default
- New translations
  - Chinese (Simplified), thanks to @coxde
  - Czech, thanks to @brezinajn
  - German, thanks to @chint95
  - Hungarian, thanks to @m3r3nix
  - Korean, thanks to @Kiina
  - Spanish, thanks to Zagon
- Bump dependencies

## [4.5.4] (April 24, 2021)

- Bug fixes:
  - "Torrents with long names get truncated in torrent detail modal (#273)" on Safari
- New translations
  - Chinese (Simplified), thanks to @coxde
  - Dutch, thanks to John Willemsen
  - Italian, thanks to Simone De Nadai
- Bump dependencies

## [4.5.3] (April 10, 2021)

- Bug fixes:
  - Tags need a F5 refresh to be displayed after being set (#266)
  - Torrents with long names get truncated in torrent detail modal (#273)
  - qBittorrent: allow .torrent download with new session directory path (#275, @angristan)
- New translations
  - French, thanks to @foXaCe
  - Hungarian, thanks to @m3r3nix
  - Japanese, thanks to @Kiina
  - Korean, thanks to @Kiina
  - Spanish, thanks to @Shutruk
- Bump dependencies

## [4.5.2] (April 4, 2021)

- Add "Log Out" button to connection interrupted page
- Add "tini" init process to containers (#260, @onedr0p)
- Bug fixes:
  - No longer fails to add some URLs to rTorrent with XMLRPC
  - Fix `Connection settings can not be empty.` after submit
- Bump dependencies

## [4.5.1] (March 31, 2021)

- Allow to press Ctrl-A or Command-A to select all torrents
- Enlarge width of "Torrent Details" modal
- Bug fixes:
  - Fix multi-file "Move torrents" of rTorrent (XMLRPC)
  - Don't close the notification panel when a button is clicked
- New translations
  - Czech, thanks to @brezinajn
  - Italian, thanks to @gmcinalli
  - Korean, thanks to @Kiina and @m4ximuel
- Bump dependencies

## [4.5.0] (March 14, 2021)

- Reannounce. Typically torrent clients do that automatically, but in some cases you may want to do it manually. It is available as a context menu action.
- Redesigned filesystem browser. Allow searching in the current directory and eliminate unnecessary requests sent to server. Additionally, navigation via arrow keys is implemented (mainly for accessibility but could be useful for anyone).
- Major accessibility enhancements. All elements are now navigable by keyboard.
- Improve scrolling performance by overscanning 30 rows.
- rTorrent:
  - JSON-RPC support for eligible versions. Preliminary tests showed that, when compared with XMLRPC, JSON-RPC yields 2x performance, 15% lower total CPU time in rTorrent process, 33% lower total CPU time in Flood process.
  - `load.throw` command support for eligible versions. Definitive response when you add torrents, so Flood won't display success when the operation actually fails.
  - Better handle command failures.
  - Verify filesystem access and respond with errors when necessary.
- Bug fixes:
  - Fix French mistranslation
  - Fix button location in download rules tab of feed modal
  - Fix "Set tracker" of single tracker torrents in rTorrent
  - Fix "Checking" bar selected style for dark color scheme
  - Recognize qBittorrent's "Forced" state
  - Disk usage service errors are no longer fatal
- New translations
  - Chinese (Simplified), thanks to @MeetWq
  - Chinese (Traditional), thanks to @vongola12324
  - Czech, thanks to @brezinajn
  - French, thanks to @Carryozor and @foXaCe
  - German, thanks to @chint95
  - Hungarian, thanks to @m3r3nix
  - Romanian, thanks to @T-z3P
- Bump dependencies

## [4.4.1] (February 6, 2021)

- Better handle tracker domain conversion and grouping
- Wrap texts (e.g. long IPv6 addresses and peer client versions) in tables of torrent details if necessary
- Distribution:
  - CI now publishes releases to AUR (Arch Linux User Repository)
  - CI now publishes Debian (`.deb`) packages to Github Releases
  - Contributions are welcome. See [distribution/README.md](https://github.com/jesec/flood/blob/v4.4.1/distribution/README.md).
- rTorrent fixes:
  - Remove [] from IPv6 addresses in peer list
- Bug fixes:
  - Remove ugly outline and highlight of focused button caused by an a11y change
  - Try to workaround potential index.html caching issues
    - Browser uses a fully cached asset tree in some cases, which defeats cache busting by asset hashes
- New translations
  - Finnish, thanks to @hyvamiesh
  - German, thanks to @chint95
- Bump dependencies

## [4.4.0] (February 2, 2021)

- Return a portable link when torrent content is requested
  - Allow sharing of links to other people
  - Allow casting (Chromecast, Airplay) of content to devices which can't authenticate with Flood
  - Allow copying the link and paste it to a player application so more formats can be streamed
  - Allow external downloaders to use the link
- Allow to register to handle magnet links in "Add by URL" panel
  - Support for "add-urls" frontend query action is added
  - e.g. `http://localhost:3000/?action=add-urls&url=magnet:?xt=`
- Allow to download .torrent file of a torrent
- Add sequential downloading support for applicable clients
  - rTorrent: requires "d.down.sequential(.set)" commands, see [jesec/rtorrent@bd904e3](https://github.com/jesec/rtorrent/commit/bd904e366367cb9cbe007381089eea066253c9e9)
  - qBittorrent: supported
  - Transmission: rejected, see [https://trac.transmissionbt.com/ticket/452](https://trac.transmissionbt.com/ticket/452)
- Add initial seeding (aka superseeding) support for applicable clients
  - [BEP16](https://www.bittorrent.org/beps/bep_0016.html)
    - Saves bandwidth for initial seeder and quickly kicks off a healthy swarm
    - NOT recommended for non-initial seeders
  - rTorrent: not exposed to RPC interface, requires [jesec/rtorrent@657089d](https://github.com/jesec/rtorrent/commit/657089d438f917714c2386c28ce9d01a6e6a2737)
  - qBittorrent: supported
  - Transmission: not supported, see [https://trac.transmissionbt.com/ticket/1691](https://trac.transmissionbt.com/ticket/1691)
- Display existing tags in alphabetical order in tag selector
- Optionally skip assets serving with `--assets=false`
  - May be useful for users who serve static assets from their own servers
  - Or developers who don't want to build assets before starting a server instance
- Refresh manifest and assets related to PWA (Progressive Web Application) support
- Separate locale and language when using "Automatic" language setting
  - Deal with minor locale differences (e.g. date formats) between language variants
  - See [#123](https://github.com/jesec/flood/issues/123)
- Remove inconsistency of clients by normalizing hashes in API responses to upper case
- Explicitly pass paths of contents to mediainfo
  - So unrelated files in the same folder won't be processed by mediainfo
- Remove dependency on shell in disk usage functions
  - New distribution-less (distroless) Docker image is now available, which has smaller size and allows maximum security
- Standalone executable:
  - Now available for `linux-arm64` and `win-arm64`
  - Bundled Node.js runtime bumped to 14.15.4
  - Linux binaries are now fully static
  - Customized Node.js runtime with smaller size and memory consumption
- rTorrent fixes:
  - Create destination directory structure before moving torrent
  - Flood API responses no longer mixes with unprocessed rTorrent method call responses
  - Properly handle multi tags while adding
  - Remove torrents (with data) can delete empty directories
- qBittorrent fixes:
  - Fix "isBasePath" for newer versions
  - Implement "isCompleted" (skip_checking)
  - Trim whitespace in `tags` property
  - Optionally set website cookie for torrent fetching (add by URL)
- Security enhancements:
  - Don't leak details of internal errors
  - Rate limits /data API endpoint
- Bug fixes:
  - Pack torrent contents one by one to avoid out-of-memory during batch downloading
  - Potential crashes related to disk usage functions in rare Docker environments
  - Disallow comma in tag
- New translations
  - Chinese (Traditional), thanks to @vongola12324
  - Czech, thanks to @brezinajn
  - Dutch, thanks to @vain4us
  - French, thanks to @Carryozor
  - German, thanks to @Ben-Wallner
  - Hungarian, thanks to @m3r3nix
  - Romanian, thanks to @T-z3P
  - Spanish, thanks to @almontegil
- Bump dependencies

Additionally, Sonarr [#4159](https://github.com/Sonarr/Sonarr/pull/4159) and Radarr [#5552](https://github.com/Radarr/Radarr/pull/5552) now supports Flood natively.

**Notes about sequential downloading:**

Drawbacks:

- https://wiki.vuze.com/w/Sequential_downloading_is_bad

Benefits:

- Sequential downloading helps with I/O performance and lowers resource consumption and cost of hardware. It enables predictable I/O patterns and efficient caching. My hard disk is really noisy while downloading a torrent. But with sequential downloading, it does not make a sound. Speed is much better as well. Sequential I/O patterns also eliminate disk fragmentation problem that damages performance/lifespan of hard disks in long-term, which is a headache for long seeders.
- "It is bad for swarms." That's correct for unhealthy swarms. However, for private torrent users, in most cases, the seeder/leecher relationship is "many seeder, single/little leecher". Plus, with the incentives/punishments of tracker sites, there is little to no risk of "draining". As such, it makes more sense to protect hardware of everyone in the swarm. Predictable I/O patterns also allow seeders to seed many torrents more efficiently: if leechers use sequential download, the read patterns become predictably sequential, which allows better I/O performance and reduces the failure rate of hard disks.
- For seedbox users: seedboxes are virtual machines. That means many users share the same physical machine. Random chunk downloading is extremely taxing on disks. As a result, usually the speeds are limited by I/O more than bandwidth. If the swarm pattern is usually "many seeder, single leecher", sequential downloading can help a lot.
- Widely known "self" benefits: stream early, stream while downloading, organize episodes quick and unpack some files before finish, etc.

## [4.3.1] (December 10, 2020)

- Make theme button always at the bottom of sidebar
- Remove legacy font formats from static assets
- Slightly tweak styles of country flags in peer list
  - Better accommodate longer flags
  - Display country code on hover
- qBittorrent fixes:
  - Attach cookies to URL downloads
  - Set trackers
- Transmission fixes:
  - Percentage downloaded of contents of a torrent
- Bug fixes:
  - API call to get peer list of a non-existent torrent no longer crash Flood server
  - Handle file not exist and access denied cases in content download
  - Properly handle API call to update password of a user
- Security enhancements:
  - Rate limit resource-intensive mediainfo request
  - Ensure path is allowed for mediainfo request
  - API call to list users no longer receive hashed passwords and client connection settings
    - Note: only an authenticated admin user may list users
- New translations
  - Czech, thanks to @brezinajn
  - Romanian, thanks to @T-z3P
- Bump dependencies

## [4.3.0] (December 1, 2020)

- Generate magnet link from torrent
- Add a button to allow user to switch color scheme
- Multi architecture Docker images
  - linux/amd64
  - linux/arm64 (new)
  - linux/arm/v7 (new)
- Allow to display precise percentage
  - Expanded view: 1 decimal place
  - Details: 3 decimal places
- Mountpoints with very long paths are ignored by disk usage
- Tags can be attached while adding torrents to qBittorrent (needs qbittorrent/qBittorrent#13882)
- Bug fixes:
  - Download destination fallback to rTorrent default destination (Mika-/torrent-control#105)
  - Properly catch errors of AddFiles and AddURLs when using qBittorrent
  - Display existing trackers in set trackers modal
- New translations
  - Spanish, thanks to @vain4us
- Bump dependencies

Side note:

I am starting to maintain a distribution of rTorrent, available at [jesec/rtorrent](https://github.com/jesec/rtorrent). It is optimized and small. It uses modern CMake and Bazel build systems. Bazel can also be used for dependency management and to produce statically linked reproducible builds.

Static binaries (amd64, arm64) can be downloaded via [Github Actions](https://github.com/jesec/rtorrent/actions?query=workflow%3A%22Publish+rolling+build%22). Docker images are also available at [jesec/rtorrent](https://hub.docker.com/r/jesec/rtorrent).

I made a simple [Dockerfile](https://github.com/jesec/flood/blob/5cc56067c3be6c91ccf94f71d4784be99c2823f8/Dockerfile.rtorrent) to demonstrate how to integrate rTorrent with Flood.

## [4.2.0] (November 25, 2020)

- Allow content of a torrent to be streamed directly if supported by browser
- New translations
  - Chinese (Traditional), thanks to @vongola12324
  - Dutch, thanks to @vain4us
  - French, thanks to @Coosos
- Bump dependencies

## [4.1.2] (November 21, 2020)

- qBittorrent fixes:
  - Remove existing tags
- New translations
  - Dutch, thanks to @vain4us
  - German, thanks to @chint95

## [4.1.1] (November 18, 2020)

- Transmission fixes:
  - Set tags while adding torrents
  - Set trackers
- New translations
  - Czech, thanks to Jan Březina
  - French, thanks to @Carryozor
  - German, thanks to @chint95
  - Romanian, thanks to @T-z3P

## [4.1.0] (November 17, 2020)

⚠️ Changes that may require manual attention: ⚠️

- Configuration is now schema validated before the start of Flood server
  - No action required if you use (preferred and default) CLI configuration interface
  - This ensures that when the config.js needs to be updated, the failure happens loud and early
  - Check [shared/schema/Config.ts](https://github.com/jesec/flood/blob/master/shared/schema/Config.ts) for more details
- Enforces that the length of secret must be larger than 30
  - Secret can be brute forced locally without interaction with the server
    - However, an attacker must get a valid token (generated by proper authentication) first
      - If all users are trusted, attackers have no way to get a valid token
  - Secret is used to sign authentication tokens but it is NOT linked to the password
    - Attacker may log into Flood as any user if they have the secret
      - However, they are still constrained by capabilities and settings (such as `--allowedpath`) of Flood

Other changes:

- Tag selector preference:
  - Single selection
  - Multi selection
- UX enhancements to tag selector
- Suggest destination based on selected tag
- `add-urls` and `add-files` API endpoints no longer fail if `destination` property is not provided
  - Download destination fallback has been implemented:
    - Tag-specific preferred download destination
    - Last used download destination
    - Default download destination of connected torrent client
  - This makes things easier for API users
  - No direct impact on Flood itself
- Remember last used "Add Torrents" tab
- Remove center alignment of certain modals to align with global styles
- Disallow browser's input suggestion when tag selector or folder browser is open
- Don't pop up the browser menu on right click while context menu is open
- Experimental standalone (single-executable) builds
- New translations
  - German, thanks to @chint95
  - Romanian, thanks to @T-z3P
- Bump dependencies
- Bug fixes:
  - Properly handle "error" alerts (display "❗" icon instead of "✅" icon)

## [4.0.2] (November 11, 2020)

- New translations
  - German, thanks to @chint95
  - Romanian, thanks to @T-z3P

## [4.0.1] (November 10, 2020)

- Fix the unreliable clear all notification button
- Bump dependencies

## [4.0.0] (November 9, 2020)

- Experimental multi-client support
  - qBittorrent
  - Transmission
- Stabilized and documented public API endpoints
- Defined and documented internal interfaces, data structures and APIs
- Better documentation for users and developers
- Full migration to TypeScript
- Reasonable test coverages for API endpoints
- Torrent creation support
- Add torrents as completed
- Dropdown selector for existing tags
- Seeding status in status filter
- Set tracker URLs of torrents
- Improved handling of rendering, updating and scrolling of torrent list
  - Preliminary tests show that Flood can now handle 500,000 torrents at least in the frontend.
  - Note: real-world performance depends on other factors such as method call and deserialization operations in the backend and data transfer between backend and frontend.
- Better performance, less memory and CPU consumption in both frontend and backend
- New translations
  - Chinese (Traditional), thanks to @vongola12324
  - Czech, thanks to Jan Březina
  - French, thanks to @Zopieux and @Mystere98
  - German, thanks to @chint95
- Bug fixes
- Security enhancements
- Dockerfile revamp
- Native build tools no longer needed as native dependency is replaced with WebAssembly variant
- Server is packed before distribution, reduced number of dependencies in production, faster installation

## [3.1.0] (September 4, 2020)

- Allow to replace main tracker of torrents
- Allow adjustment of visible context menu items
- config.cli: make all configs configurable by options and env
- styles: properly set width of clipboard icon (fixes #26)
- client: hide logout button when auth is disabled
- Hungarian support (#21), thanks to @m3r3nix
- New translations:
  - Chinese Traditional, thanks to @vongola12324
  - Czech, thanks to @brezina.jn
  - Portuguese, thanks to @Zamalor
- Security enhancements:
  - Allow restriction on file operations by paths
  - Do not bypass authentication token validation with disableUsersAndAuth
  - server: prohibit Cross-Origin Resource Sharing
  - server: auth: strictly prohibit cross-site cookie
- Minor security fixes:
  - rTorrentDeserializer: avoid double unescaping
  - SettingsModal: mergeObjects: prevent prototype pollution
  - server: setSettings: turn inboundTransformations into a Map to validate dynamic call
  - server: be explicit about client app routes
  - server: cache index.html into memory
- Minor refactoring and other changes
- Bump dependencies to the latest revisions

## [3.0.0] (August 25, 2020)

- BREAKING CHANGES:
  - If `baseURI` is set, server will only respond to requests with baseURI. For instance, if you use `location /flood {proxy_pass http://127.0.0.1:3000;}`, you would have to change it to `location /flood {proxy_pass http://127.0.0.1:3000/flood;}`.
  - Static assets now use relative paths only. It is no longer needed to recompile after `baseURI` change.
  - Location of runtime files are rearranged. New default location for runtime files is `./run` folder. `tempPath` is now made configurable.
  - Static assets are relocated to `./dist` folder. You have to change the path from `./server/assets` to `./dist/assets` if you serve static assets from web server.
  - Flood will refuse to start if secrets are detected in static assets. Former default secret `flood` and some other weak secrets are no longer accepted.
- A command line interface is added as `config.cli.js`. Rename it to `config.js` and run `npm run start -- --help` for more details.
- With some changes, Flood is now ready for publish to `npm`. You can now use `sudo npm install -g flood` to get a ready-to-use copy of Flood, then run `flood`. It is even easier with `npx`, try `npx flood --help` now.
- Better localization:
  - Flood project is now integrated with [Crowdin](https://crwd.in/flood), a renowned translation management system. It is now easier than ever to contribute your translations to Flood.
  - Language will now be automatically detected from your browser by default.
  - New languages are supported: `Čeština`, `Deutsch`, `italiano`, `norsk`, `Polskie`, `русский язык`, `Romanian`, `svenska`, `українська мова`, `日本語` and `اَلْعَرَبِيَّةُ` thanks to `Crowdin Machine Translation`.
  - New translations for `Chinese (Traditional)` thanks to @vongola12324.
  - New translations for `Dutch` thanks to @NLxDoDge.
  - New translations for `Portuguese` thanks to @MiguelNdeCarvalho.
- Support for touch and smaller screen devices:
  - Sidebar is able to be collapsed via a button. It is collapsed by default when screen width is lower than `720px`.
  - Modals (Settings, Torrent Details, Add Torrent, etc.) are tuned for smaller screen devices.
  - It is now possible to open context (right click) menu on iOS/Safari devices by long pressing the item.
  - Drag and drop is now possible for touch devices. You can now adjust the order of columns in Settings on touch devices.
  - Widths of columns are now adjustable on touch devices. (condensed view)
- Dark color scheme support:
  - Flood now automatically switches between light and dark color scheme based on your system settings.
- XML special chars (`&`, `<`, `>`, `'`, `"`) are properly handled. For instance, escaped chars like `&` will be properly displayed as `&` instead of `&amp;`. File operations on torrent with special chars no longer fail.
- `squashfs` and `tmpfs` mount points are now excluded by default in disk usage. This hopefully makes sure that useless system mounts won't spam the list.
- `More Info` button in expanded view is removed.
- More dependencies are bumped to the latest revisions.

## [2.0.0] (August 5, 2020)

- BREAKING CHANGES:
  - Bump dependencies to the latest version if possible
  - Node 12 or later is now required
- Supports connecting to multiple rtorrent instances (one per user)
  - Moved rtorrent configuration to user database
  - Prompts user for connection details in UI when can't connect to rtorrent
- Changed `/list/` route to `/overview/`
- Reorganized and renamed component source files
- Removed verbose logging from `HistoryEra`
- Check existing feed items against new download rules
- Switch URL and Label textboxes in Add Feed form to match the Download Rules form
- Rate-limit the SCGI calls to rTorrent
  - Sends only one call at a time
  - Sends at most one call every 250 miliseconds
- Implement "actity stream"
  - The Flood client no longer polls the Flood server on an interval. Instead,
    the Flood server polls rTorrent on a more regular interval and emits changes
    via an event-stream. This significantly reduces data usage on the Flood client
  - Stream covers torrent list, transfer rate summary & history,
    torrent taxonomy, and notification count.
- Close event stream after the window/tab has been inactive for 30 seconds
- Refactor development experience, using `Webpack` & `WebpackDevServer`
- Require users to build static assets again
- Simplify peer geo flag handling
  - Flag images now serves as static asset
- moveTorrents: Allow hash check to be skipped by user
- Add an option to completely disable users and authentication
- server: Takes baseURI into account for routes and assets
- torrentListPropMap: use d.hashing= instead of d.is_hash_checking=
  - Torrents queued for checking are now shown
- sidebar: Add Checking filter view

## [1.0.0] (April 21, 2017)

- First "official" release
- Change log and semver versioning (finally)
- Control basic rTorrent settings via web UI
  - Transfer rate limiting
  - Connection settings
  - Resource utilization
- Add torrents via URLs or files
- User authentication
- UI translations (only en, fr, and nl)
- Custom torrent tags
- Customizable torrent list
  - "Expanded" and "condensed" views
  - Customizable torrent detail columns
- Basic torrent list filtering (by status, tag, and tracker)
- Auto-download torrents from RSS feeds

[1.0.0]: https://github.com/Flood-UI/flood/compare/ae520c0a33ffb4ae6f21e47bc6f7e6007dd1e6dc...v1.0.0
[2.0.0]: https://github.com/jesec/flood/compare/v1.0.0...v2.0.0
[3.0.0]: https://github.com/jesec/flood/compare/v2.0.0...v3.0.0
[3.1.0]: https://github.com/jesec/flood/compare/v3.0.0...v3.1.0
[4.0.0]: https://github.com/jesec/flood/compare/v3.1.0...v4.0.0
[4.0.1]: https://github.com/jesec/flood/compare/v4.0.0...v4.0.1
[4.0.2]: https://github.com/jesec/flood/compare/v4.0.1...v4.0.2
[4.1.0]: https://github.com/jesec/flood/compare/v4.0.2...v4.1.0
[4.1.1]: https://github.com/jesec/flood/compare/v4.1.0...v4.1.1
[4.1.2]: https://github.com/jesec/flood/compare/v4.1.1...v4.1.2
[4.2.0]: https://github.com/jesec/flood/compare/v4.1.2...v4.2.0
[4.3.0]: https://github.com/jesec/flood/compare/v4.2.0...v4.3.0
[4.3.1]: https://github.com/jesec/flood/compare/v4.3.0...v4.3.1
[4.4.0]: https://github.com/jesec/flood/compare/v4.3.1...v4.4.0
[4.4.1]: https://github.com/jesec/flood/compare/v4.4.0...v4.4.1
[4.5.0]: https://github.com/jesec/flood/compare/v4.4.1...v4.5.0
[4.5.1]: https://github.com/jesec/flood/compare/v4.5.0...v4.5.1
[4.5.2]: https://github.com/jesec/flood/compare/v4.5.1...v4.5.2
[4.5.3]: https://github.com/jesec/flood/compare/v4.5.2...v4.5.3
[4.5.4]: https://github.com/jesec/flood/compare/v4.5.3...v4.5.4
[4.6.0]: https://github.com/jesec/flood/compare/v4.5.4...v4.6.0
[4.6.1]: https://github.com/jesec/flood/compare/v4.6.0...v4.6.1
[4.7.0]: https://github.com/jesec/flood/compare/v4.6.1...v4.7.0
[4.8.0]: https://github.com/jesec/flood/compare/v4.7.0...v4.8.0
[4.8.1]: https://github.com/jesec/flood/compare/v4.8.0...v4.8.1
[4.8.2]: https://github.com/jesec/flood/compare/v4.8.1...v4.8.2
