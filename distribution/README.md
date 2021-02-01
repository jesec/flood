# Distributing Flood

This directory contains files related to distribution of Flood. Some are being used by continuous integration scripts of this project to release a certain version of Flood. Some are merely examples that have been created to make it easier for potential contributors to maintain a package of Flood for their distributions.

In general, Flood has two release channels: `master` and `latest`:

- `master` (rolling) channel is handled by CI scripts that are triggered whenever there is a push to `master` branch.
- `latest` (release) channel is versioned (eg. `4.0.0`), in accordance with [semver](https://semver.org/).

### npm (Node Package Manager)

`npm` is the primary method of distribution. Flood is published to two packages:

- `master` -> [npmjs.com/@jesec/flood](https://www.npmjs.com/@jesec/flood)
- `latest` -> [npmjs.com/flood](https://www.npmjs.com/flood)

Other distribution methods may rely on builds published on `npm`.

### Standalone executables

Flood uses [pkg](https://github.com/jesec/pkg) to generate self-contained executables that bundles Flood with Node.js runtime. Generated executables are published to two locations:

- `master` -> [Github Actions](https://github.com/jesec/flood/actions?query=workflow%3A%22Publish+rolling+build%22) ([permalink via nightly.link](https://nightly.link/jesec/flood/workflows/publish-rolling/master))
- `latest` -> [Github Releases](https://github.com/jesec/flood/releases)

Other distribution methods may rely on generated standalone executables.

### Containers

`containers` folder hosts files required to build a container image. Currently there are three variants that are published in two stages:

**Variants:**

- Default (`latest`, `master`, versioned tags): Node.js Current on Alpine Linux (parent image: `node:alpine`)
- Debugging (`*-dbg`): Node.js Current on Alpine Linux (parent image: `node:alpine`)
  - Contains full sources (not minimized) and development dependencies
- Distroless (`*-distroless`): Node.js Active LTS (no parent image)
  - Contains only `flood` and its runtime dependencies
  - No shell, no package manager, no libc, no coreutils

**Stages:**

- `flood` ([jesec/flood](https://hub.docker.com/r/jesec/flood))
- `rtorrent-flood` ([jesec/rtorrent-flood](https://hub.docker.com/r/jesec/rtorrent-flood))
  - Bundles [rtorrent](https://hub.docker.com/r/jesec/rtorrent)

### Misc

`shared` folder hosts files that may be useful in a package, in addition to:

```
CHANGELOG.md
LICENSE
README.md
SECURITY.md
```

However, there might be more recent ones in user-contributed [wiki](https://github.com/jesec/flood/wiki) of this project.

### License

Notwithstanding GPL 3 license applied to other parts of this project, files in this folder are licensed under BSD 0-Clause License (SPDX: 0BSD), which is a public domain equivalent license.

```
Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

### Links to downstream repositories of packages

TBD.

### Contributing

Contributions are welcome.
