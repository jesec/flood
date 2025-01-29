load("@rules_pkg//:pkg.bzl", "pkg_deb", "pkg_tar")

DESCRIPTION = "modern web user interface for various torrent clients"

HOMEPAGE = "https://github.com/jesec/flood"

MAINTAINER = "replace-with-your-name <to-be-determined@tbd>"

PACKAGE = "flood"

RECOMMENDS = ["mediainfo"]

VERSION = "version-to-be-replaced-0"

genrule(
    name = "flood-pkg-arm64",
    srcs = [
        "dist/index.js",
        "package.json",
    ] + glob(["node_modules/**/*"]),
    outs = ["arm64/flood"],
    cmd = "pkg $$(dirname $(location package.json)) -t node18-linuxstatic-arm64 --out-path $(RULEDIR)/arm64",
    executable = True,
)

genrule(
    name = "flood-pkg-x64",
    srcs = [
        "dist/index.js",
        "package.json",
    ] + glob(["node_modules/**/*"]),
    outs = ["x64/flood"],
    cmd = "pkg $$(dirname $(location package.json)) -t node18-linuxstatic-x64 --out-path $(RULEDIR)/x64",
    executable = True,
)

pkg_tar(
    name = "flood-assets",
    srcs = glob(["dist/assets/**/*"]),
    mode = "0644",
    package_dir = "/usr/share/flood/assets",
    strip_prefix = "/dist/assets",
)

pkg_tar(
    name = "flood-bin-arm64",
    srcs = [":flood-pkg-arm64"],
    mode = "0755",
    package_dir = "/usr/bin",
    strip_prefix = "/arm64",
)

pkg_tar(
    name = "flood-bin-x64",
    srcs = [":flood-pkg-x64"],
    mode = "0755",
    package_dir = "/usr/bin",
    strip_prefix = "/x64",
)

pkg_tar(
    name = "flood-docs",
    srcs = [
        "CHANGELOG.md",
        "LICENSE",
        "README.md",
        "SECURITY.md",
    ],
    mode = "0644",
    package_dir = "/usr/share/doc/flood",
    strip_prefix = "/",
)

pkg_tar(
    name = "flood-service",
    srcs = ["distribution/shared/flood@.service"],
    mode = "0644",
    package_dir = "/etc/systemd/system",
    strip_prefix = "/distribution/shared",
)

pkg_tar(
    name = "flood-deb-data-arm64",
    extension = "tar.gz",
    deps = [
        ":flood-assets",
        ":flood-bin-arm64",
        ":flood-docs",
        ":flood-service",
    ],
)

pkg_tar(
    name = "flood-deb-data-x64",
    extension = "tar.gz",
    deps = [
        ":flood-assets",
        ":flood-bin-x64",
        ":flood-docs",
        ":flood-service",
    ],
)

CONFFILES = [
    "/etc/systemd/system/flood@.service",
]

pkg_deb(
    name = "flood-deb-arm64",
    architecture = "arm64",
    conffiles = CONFFILES,
    data = ":flood-deb-data-arm64",
    description = DESCRIPTION,
    homepage = HOMEPAGE,
    maintainer = MAINTAINER,
    package = PACKAGE,
    recommends = RECOMMENDS,
    version = VERSION,
)

pkg_deb(
    name = "flood-deb-x64",
    architecture = "amd64",
    conffiles = CONFFILES,
    data = ":flood-deb-data-x64",
    description = DESCRIPTION,
    homepage = HOMEPAGE,
    maintainer = MAINTAINER,
    package = PACKAGE,
    recommends = RECOMMENDS,
    version = VERSION,
)
