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

FROM docker.io/ubuntu:focal as flood

COPY ./.devcontainer/library-scripts /tmp/library-scripts/

# Configure base container
RUN /bin/bash /tmp/library-scripts/common-debian.sh true vscode 1000 1000 true

# Install prerequisites
RUN apt update
RUN apt install -y \
    dpkg-dev software-properties-common

# Configure Docker-from-Docker
RUN /bin/bash /tmp/library-scripts/docker-debian.sh true "/var/run/docker-host.sock" "/var/run/docker.sock" vscode false
ENTRYPOINT ["/usr/local/share/docker-init.sh"]
CMD ["sleep", "infinity"]

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

# Run as vscode user
USER vscode

# Apply shell customizations
RUN git clone https://github.com/jesec/.dotfiles.git ~/.dotfiles
RUN cd ~/.dotfiles && bash setup.sh

# Expose port 3000 and 4200
EXPOSE 3000
EXPOSE 4200
