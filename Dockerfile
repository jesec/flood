# WARNING:
# This Dockerfile uses contents of current folder which might contain
# secrets, uncommitted changes or other sensitive information. DO NOT
# publish the result image unless it was composed in a clean environment.

ARG BUILDPLATFORM=amd64
ARG NODE_IMAGE=node:alpine

FROM --platform=$BUILDPLATFORM ${NODE_IMAGE} as nodebuild

WORKDIR /usr/src/app/

# Copy project files
COPY . ./

# Install build dependencies
RUN apk --no-cache add \
    python build-base

# Fetch dependencies from npm
RUN npm ci --no-optional

# Build package
RUN cp config.cli.js config.js
RUN npm pack

# Now get the clean Node.js image
FROM ${NODE_IMAGE} as install

# Copy package built
COPY --from=nodebuild /usr/src/app/flood-*.tgz /tmp/

# Install package
RUN npm i -g /tmp/flood-*.tgz

# Install runtime dependencies
RUN apk --no-cache add \
    mediainfo

# Remove temporary files and caches
RUN rm -rf /tmp/* /root/*

# Cleanups below are destructive
# Let the maintainer know if there is a usecase that requires extension to this image

# Remove apk, npm and yarn
RUN rm -rf /lib/apk /sbin/apk
RUN rm -rf /usr/local/lib/node_modules/npm
RUN rm -rf /opt/*

# Remove Node.js development files
RUN rm -rf /usr/local/include/node

# Get the scratch image
FROM scratch as flood

COPY --from=install / /

# Create "download" user
RUN adduser -h /home/download -s /sbin/nologin --disabled-password download

# Run as "download" user
USER download

# Expose port 3000
EXPOSE 3000

# Flood
ENTRYPOINT ["flood", "--host=0.0.0.0"]
