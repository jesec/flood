# WARNING:
#
# For development only. Use Dockerfile.release for production.
#
# This image bundles rTorrent, qBittorrent and Transmission for easier
# testing. They are not started by default. scripts/testsetup.js can
# quickly start a working Flood + rTorrent environment.
#
# Sources should be mounted to /workspaces/flood.

FROM docker.io/ubuntu:jammy

# Ensure apt is in non-interactive mode
ENV DEBIAN_FRONTEND=noninteractive

# Install prerequisites
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    software-properties-common \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get update && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm 9.7.0
RUN npm install -g pnpm@9.7.0

# Install rTorrent from jesec's releases (same as CI)
RUN wget -q https://github.com/jesec/rtorrent/releases/latest/download/rtorrent-linux-amd64.deb && \
    apt-get install -y --no-install-recommends ./rtorrent-linux-amd64.deb && \
    rm rtorrent-linux-amd64.deb

# Install qBittorrent from PPA
RUN add-apt-repository -y ppa:qbittorrent-team/qbittorrent-stable && \
    apt-get update && \
    apt-get install -y --no-install-recommends qbittorrent-nox && \
    rm -rf /var/lib/apt/lists/*

# Install Transmission from default repos (PPA not available for jammy)
RUN apt-get update && \
    apt-get install -y --no-install-recommends transmission-daemon && \
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
