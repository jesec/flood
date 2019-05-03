ARG NODE_IMAGE=node:10.1-alpine
ARG WORKDIR=/usr/src/app/

FROM ${NODE_IMAGE} as nodebuild
ARG WORKDIR

WORKDIR $WORKDIR

# Generate node_modules
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN apk add --no-cache --virtual=build-dependencies \
    python \
    build-base && \
    npm install && \
    apk del --purge build-dependencies

# Build static assets and remove devDependencies.
COPY client ./client
COPY shared ./shared
COPY config.docker.js ./config.js
COPY ABOUT.md ./ABOUT.md
RUN npm run build && \
    npm prune --production
COPY server ./server

# Now get the clean image without any dependencies and copy compiled app
FROM ${NODE_IMAGE} as flood
ARG WORKDIR

WORKDIR $WORKDIR

# Install runtime dependencies.
RUN apk --no-cache add \
    mediainfo

COPY --from=nodebuild $WORKDIR $WORKDIR

# Hints for consumers of the container.
EXPOSE 3000
VOLUME ["/data"]

# Start application.
CMD [ "npm", "start" ]
