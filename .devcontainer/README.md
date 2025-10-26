# Flood Development Container

This directory contains the development container configuration for Flood, providing a consistent development environment with all necessary tools and dependencies pre-installed.

## 🚀 Quick Start

1. Install [VS Code](https://code.visualstudio.com/) and the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open this repository in VS Code
3. Click "Reopen in Container" when prompted (or use Command Palette → "Dev Containers: Reopen in Container")
4. Wait for the container to build/start (first time may take a few minutes)

The dev container uses a **prebuilt image** that's automatically cached, making subsequent startups much faster!

## 📦 Prebuilt Image

The dev container image is automatically built and published to GitHub Container Registry (ghcr.io) via GitHub Actions:

- **Image:** `ghcr.io/jesec/flood/devcontainer:latest`
- **Workflow:** `.github/workflows/devcontainer-prebuild.yml`
- **Triggers:**
  - Push to master (when `.devcontainer/` files change)
  - Pull requests modifying dev container files
  - Weekly schedule (Sundays at 00:00 UTC) to keep dependencies fresh
  - Manual workflow dispatch

### Benefits of Prebuilding

- ✅ **Faster startup**: Cached image layers mean quick container creation
- ✅ **Consistency**: Everyone uses the same pre-built environment
- ✅ **Fresh dependencies**: Weekly rebuilds keep Node.js, pnpm, and torrent clients up-to-date
- ✅ **Lower bandwidth**: Download cached layers instead of building from scratch

## 🛠️ What's Included

### Base System

- **OS:** Ubuntu 22.04 LTS (jammy)
- **Node.js:** v22.x (matches CI and production targets)
- **Package Manager:** pnpm 9.7.0
- **Shell:** zsh with Oh My Zsh

### Development Tools

- Git
- Docker CLI (docker-outside-of-docker)
- VS Code extensions (ESLint, Prettier, GitLens, etc.)

### Torrent Clients (for testing)

- **rTorrent** (from jesec/rtorrent:master image)
- **qBittorrent** (from qbittorrent-team/qbittorrent-stable PPA)
- **Transmission** (from transmissionbt PPA)

### Runtime Dependencies

- mediainfo (for torrent metadata extraction)

## 🔧 Configuration Files

- **`devcontainer.json`**: Main dev container configuration
  - Features: docker-outside-of-docker, git, common-utils (zsh/oh-my-zsh)
  - Port forwarding: 3000 (Flood server), 4200 (webpack dev server), 6006 (Storybook)
  - Volume mounts: `.docker`, `.ssh`, `.npmrc`, etc. (for credential sharing)
  - Cache: Pulls `ghcr.io/jesec/flood/devcontainer:latest` as build cache

- **`Dockerfile`**: Container image definition
  - Multi-stage build: Uses jesec/rtorrent:master as base
  - Optimized for layer caching and minimal image size
  - All dependencies pre-installed and configured

## 📝 Common Tasks

### Running Tests

```bash
# Backend tests (spawns real torrent clients)
npm test

# Frontend tests
npm run test:client

# Storybook tests
npm run test-storybook
```

### Starting Development Servers

```bash
# Terminal 1: Backend server (port 3000)
npm run start:development:server

# Terminal 2: Frontend dev server (port 4200)
npm run start:development:client

# Terminal 3: Storybook (port 6006)
npm run storybook
```

### Type Checking and Linting

```bash
# Type check
npm run check-types

# Lint
npm run lint

# Format
npm run format-source
```

## 🔄 Rebuilding the Image

The prebuilt image is automatically rebuilt when:

- `.devcontainer/` files are modified and pushed to master
- Weekly on Sundays (keeps dependencies fresh)
- Manually triggered via GitHub Actions

### Manual Rebuild

1. Go to [Actions → Prebuild Dev Container](../../actions/workflows/devcontainer-prebuild.yml)
2. Click "Run workflow"
3. Wait for the build to complete (~5-10 minutes)
4. Rebuild your local container: Command Palette → "Dev Containers: Rebuild Container"

### Local Development Build

If you need to test dev container changes locally:

1. Edit `Dockerfile` or `devcontainer.json`
2. Command Palette → "Dev Containers: Rebuild Container"
3. Your changes will be built on top of the cached base image

## 🐛 Troubleshooting

### Container won't start

- Check Docker is running: `docker ps`
- Check Docker has enough resources (4GB+ RAM recommended)
- Try rebuilding: Command Palette → "Dev Containers: Rebuild Container"

### Slow initial build

- First build downloads the prebuilt image (~2GB)
- Subsequent builds use cached layers (much faster)
- Check internet connection speed

### Torrent client tests failing

- Ensure you're running inside the dev container
- Torrent clients are pre-installed in the container
- Check logs: `npm test -- --verbose`

### Out-of-date dependencies

- The prebuilt image is rebuilt weekly
- For immediate update: Trigger workflow manually (see above)
- Or rebuild locally: "Dev Containers: Rebuild Container"

## 📚 Resources

- [VS Code Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [Dev Container Specification](https://containers.dev/)
- [Flood Development Guide](../CLAUDE.md)
