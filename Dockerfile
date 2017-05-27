FROM node:7.8.0-onbuild
COPY config.docker.js config.js

RUN apt-get update && apt-get install -y mediainfo && rm -rf /var/lib/apt/lists/*

EXPOSE 3000
VOLUME ["/data"]
