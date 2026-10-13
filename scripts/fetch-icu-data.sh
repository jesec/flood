#!/bin/sh

# Fetch the ICU data required by the prebuilt executables: they bundle a small-icu Node.js, whose
# Intl.Segmenter needs this data file. ICU_DATA_VERSION has to match process.versions.icu of the
# Node.js bundled in the pkg base binaries, which the executables are built from.
set -eu

ICU_DATA_VERSION=78.2
ICU_DATA_SHA256=6fc51a8818242bfd83207ab89551166ac2fb4bf502d01e41cddc8cb6a0ba4cda

if [ "$#" -ne 1 ]; then
  echo "usage: $0 OUTPUT_DIR" >&2
  exit 1
fi

out="$1"
mkdir -p "$out"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

curl -fsSL -o "$tmp/icu-data.zip" \
  "https://github.com/unicode-org/icu/releases/download/release-${ICU_DATA_VERSION}/icu4c-${ICU_DATA_VERSION}-data-bin-l.zip"
echo "${ICU_DATA_SHA256}  $tmp/icu-data.zip" | sha256sum -c -

unzip -j -o "$tmp/icu-data.zip" icudt78l.dat LICENSE -d "$out"
mv "$out/LICENSE" "$out/icudt78l.dat.LICENSE"
