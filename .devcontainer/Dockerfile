# WARNING:
#
# For development only. Use Dockerfile.release for production.
#
# This image bundles rTorrent, qBittorrent and Transmission for easier
# testing. They are not started by default. scripts/testsetup.js can
# quickly start a working Flood + rTorrent environment.
#
# Sources should be mounted to /workspaces/flood.

FROM docker.io/jesec/rtorrent:master as rtorrent

FROM docker.io/ubuntu:jammy as flood

# Ensure apt is in non-interactive mode
ENV DEBIAN_FRONTEND=noninteractive

# Install prerequisites
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get update && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm 9.7.0
RUN npm install -g pnpm@9.7.0

# Install rTorrent, qBittorrent and Transmission
COPY --from=rtorrent / /
RUN add-apt-repository -y ppa:qbittorrent-team/qbittorrent-stable && \
    add-apt-repository -y ppa:transmissionbt/ppa && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    qbittorrent-nox \
    transmission-daemon && \
    rm -rf /var/lib/apt/lists/*

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    mediainfo && \
    rm -rf /var/lib/apt/lists/*

# Expose ports for Flood server, webpack dev server, and Storybook
EXPOSE 3000 4200 6006

# Default command (overridden by dev container features)
CMD ["sleep", "infinity"]
