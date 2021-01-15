# WARNING:
#
# For development and debugging only. Use Dockerfile.release for production.
#
# This Dockerfile uses contents of current folder which might contain
# secrets, uncommitted changes or other sensitive information. DO NOT
# publish the result image unless it was composed in a clean environment.

ARG BUILDPLATFORM=amd64
ARG NODE_IMAGE=node:alpine

FROM --platform=$BUILDPLATFORM ${NODE_IMAGE}

WORKDIR /usr/src/app/

# Copy project files
COPY . ./

# Install dependencies
RUN apk --no-cache add \
    python build-base mediainfo

# Fetch dependencies from npm
RUN npm ci --no-optional && npm cache clean --force

# Build assets
RUN cp config.cli.js config.js
RUN npm run build-assets

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
