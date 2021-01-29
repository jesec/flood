# WARNING:
#
# For development only. Use Dockerfile.release for production.
#
# This image bundles rTorrent, qBittorrent and Transmission for easier
# testing. They are not started by default. scripts/testsetup.js can
# quickly start a working Flood + rTorrent environment.
#
# Sources should be mounted to /workspaces/flood.

FROM jesec/rtorrent:master as rtorrent

FROM mcr.microsoft.com/vscode/devcontainers/base:focal as flood

# Install prerequisites
RUN apt update
RUN apt install -y \
    apt-transport-https curl software-properties-common

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_15.x | bash -
RUN apt install -y \
    nodejs

# Install rTorrent, qBittorrent and Transmission
COPY --from=rtorrent / /
RUN add-apt-repository -y ppa:qbittorrent-team/qbittorrent-unstable
RUN add-apt-repository -y ppa:transmissionbt/ppa
RUN apt install -y \
    qbittorrent-nox transmission-daemon

# Install development tools
RUN apt install -y \
    git zsh

# Install runtime dependencies
RUN apt install -y \
    mediainfo

# Configure Docker-in-Docker
COPY ./.devcontainer/library-scripts /tmp/library-scripts/
RUN /bin/bash /tmp/library-scripts/docker-in-docker-debian.sh true vscode false

# Run as vscode user
USER vscode

# Apply shell customizations
RUN git clone https://github.com/jesec/.dotfiles.git ~/.dotfiles
RUN cd ~/.dotfiles && bash setup.sh

# Expose port 3000 and 4200
EXPOSE 3000
EXPOSE 4200
