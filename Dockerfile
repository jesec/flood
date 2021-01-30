# WARNING:
#
# For development and debugging only. Use Dockerfile.release for production.
#
# This image bundles rTorrent for easier debugging. It is not started by default.
# Use --rtorrent argument if you wish to start the bundled rTorrent.
# For production, use rtorrent-flood instead.
#
# This Dockerfile uses contents of current folder which might contain
# secrets, uncommitted changes or other sensitive information. DO NOT
# publish the result image unless it was composed in a clean environment.

ARG BUILDPLATFORM=amd64
ARG NODE_IMAGE=node:alpine

FROM jesec/rtorrent:master as rtorrent

FROM --platform=$BUILDPLATFORM ${NODE_IMAGE} as nodebuild

WORKDIR /usr/src/app/

# Copy project files
COPY . ./

# Fetch dependencies from npm
RUN npm ci --no-optional

# Build assets
RUN npm run build-assets

# Now get the clean Node.js image
FROM ${NODE_IMAGE} as flood

WORKDIR /usr/src/app/

# Copy sources
COPY --from=nodebuild /usr/src/app ./

# Copy rTorrent
COPY --from=rtorrent / /

# Install runtime dependencies
RUN apk --no-cache add \
    mediainfo

# Create "download" user
RUN adduser -h /home/download -s /sbin/nologin --disabled-password download

# Run as "download" user
USER download

# Expose port 3000 and 4200
EXPOSE 3000
EXPOSE 4200

# Flood server in development mode
ENTRYPOINT ["npm", "--prefix=/usr/src/app/", "run", "start:development:server", "--", "--host=0.0.0.0"]

# Then, to start a debugging session of frontend:
# docker exec -it ${container_id} npm --prefix=/usr/src/app/ run start:development:client
