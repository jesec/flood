ARG NODE_IMAGE=node:alpine

FROM ${NODE_IMAGE} as nodebuild

WORKDIR /usr/src/app/

# Copy project files
COPY . ./

# Fetch dependencies from npm
RUN npm install

# Build package
RUN npm pack

# Now get the clean image
FROM ${NODE_IMAGE} as flood

# Copy package built
COPY --from=nodebuild /usr/src/app/*.tgz /tmp/

# Install package
RUN npm i -g /tmp/*.tgz --unsafe-perm
RUN rm /tmp/*.tgz

# Install runtime dependencies
RUN apk --no-cache add \
    mediainfo

# Create "download" user
RUN adduser -h /home/download -s /sbin/nologin --disabled-password download

# Run as "download" user
USER download

# Expose port 3000
EXPOSE 3000

# Flood
ENTRYPOINT ["flood", "--host=0.0.0.0"]
