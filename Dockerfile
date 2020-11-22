# WARNING:
# This Dockerfile uses contents of current folder which might contain
# secrets, uncommitted changes or other sensitive information. DO NOT
# publish the result image unless it was composed in a clean environment.

ARG NODE_IMAGE=node:alpine

FROM ${NODE_IMAGE} as nodebuild

WORKDIR /usr/src/app/

# Copy project files
COPY . ./

# Install build dependencies
RUN apk --no-cache add \
    python build-base

# Fetch dependencies from npm
RUN npm set unsafe-perm true
RUN npm install

# Build package
RUN cp config.cli.js config.js
RUN npm run build
RUN npm pack --ignore-scripts

# Now get the clean image
FROM ${NODE_IMAGE} as flood

# Copy package built
COPY --from=nodebuild /usr/src/app/*.tgz /tmp/

# Install package
RUN npm i -g /tmp/*.tgz --unsafe-perm
RUN rm /tmp/*.tgz

# Install runtime dependencies
RUN apk --no-cache add \
    mediainfo su-exec

# Expose port 3000
EXPOSE 3000

# Copy docker entrypoint script
COPY docker-entrypoint.sh /

# Flood
ENTRYPOINT ["/docker-entrypoint.sh", "flood", "--host=0.0.0.0"]
