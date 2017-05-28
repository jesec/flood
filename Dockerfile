FROM node:7.8.0-onbuild
RUN apt-get update && apt-get install -y mediainfo && rm -rf /var/lib/apt/lists/*
COPY config.docker.js config.js
EXPOSE 3000
VOLUME ["/data"]
