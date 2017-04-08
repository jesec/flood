FROM node:7.8.0-onbuild
COPY config.docker.js config.js

EXPOSE 3000
VOLUME ["/data"]
