# Flood as a Debian (.deb) package

Tools used for installation: `apt`, `dpkg`

**flood**

`flood` folder is a proper `debian` directory structure that is created with the existing policies and tools of Debian in mind. It uses Node.js runtime of system.

Some changes would be needed to make it fully comply with Debian policies. Specially, Debian prefers the package to use Git repository as source instead of published tar bundle from npm registry. However, maintainer of this project notes that Debian's own collection of JavaScript packages is severely out-of-date, and, as a result, it would take significant efforts to add the whole dependency tree of this project to Debian.

No continuous integration is planned.

**flood-bin**

`flood-bin` folder contains [Bazel](https://bazel.build) rules that use standalone executables to create Debian packages. It is compatible with any distribution that is able to install `.deb` package.

To build, copy its contents to the root of repository, compile Flood (by `npm build` or extracting a tarball) and run `bazel build flood-deb-x64 (or flood-deb-arm64)`. The result `.deb` is available in `bazel-bin`.

A CI workflow automatically pushes new releases to [Releases](https://github.com/jesec/flood/releases) and [deb.jesec.io](https://deb.jesec.io).
