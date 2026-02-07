# Contributing

We love contributions from everyone.

# Issue

See [ISSUE_TEMPLATE](ISSUE_TEMPLATE).

# Pull request

See [PULL_REQUEST_TEMPLATE.md](PULL_REQUEST_TEMPLATE.md).

# Embedded frontend static assets

Flood can serve the web UI in two ways:

- **Embedded assets**: the built frontend files are bundled into the server binary/build output and served directly from memory.
- **Filesystem assets**: the server serves files from the local build output directory.

## Why embedded assets?

Embedding is mainly for distribution and packaging, single deployable artifact, no separate `dist/assets/` directory to ship.

## Runtime behavior

- If embedded assets are present, Flood serves the UI from the embedded map.
  - Asset bodies are decoded from base64 to `Buffer` once at startup, then reused per request.
- If embedded assets are not present, Flood serves static files from `dist/assets/`.
  - In development, `dist/assets/index.html` may not exist (e.g. when using the webpack dev server); in that case the server won’t crash, and UI routes will return 404.

## Development tips

- For full local dev, run the client dev server and the backend dev server (see the repo’s main README for commands).
- If you’re testing the server’s built-in static serving, make sure the client build has produced `dist/assets/`.
