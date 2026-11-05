# Source of the vendored protobuf contract

- Repository: rstorrent (local development checkout: `../rstorrent`)
- Commit: `5dec590`
- File: `crates/rt-grpc/proto/rstorrent.proto` (package `rtorrent.v1`)

`rstorrent.proto` must stay byte-for-byte identical to the upstream file so that
it can be diffed against the daemon's contract. Do not edit it manually.

## Refreshing the vendored copy and generated bindings

```bash
cp ../rstorrent/crates/rt-grpc/proto/rstorrent.proto \
   server/services/rTorrent/grpc/proto/rstorrent.proto
pnpm run proto:generate
git add server/services/rTorrent/grpc/proto
```

Update the commit hash above in the same change.
