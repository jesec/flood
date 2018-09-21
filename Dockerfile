ARG NODE_IMAGE=node:10.1-alpine

FROM ${NODE_IMAGE} as nodebuild

WORKDIR /usr/src/app

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
RUN npm run build && \
    npm prune --production
COPY server ./server

# Install runtime dependencies.
RUN apk --no-cache add \
    mediainfo

# Hints for consumers of the container.
EXPOSE 3000
VOLUME ["/data"]

# Start application.
CMD [ "npm", "start" ]
