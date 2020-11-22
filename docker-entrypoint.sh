#!/bin/sh -e

FLOOD_USER=${FLOOD_USER:-download}

if [ -n "$FLOOD_UID" ]; then
    OPTS="-u $FLOOD_UID"
fi

if [ -n "$FLOOD_GID" ]; then
    OPTS="$OPTS -G $FLOOD_USER"
    addgroup -g $FLOOD_GID $FLOOD_USER
fi

adduser -h /home/download -g $FLOOD_USER -D -s /sbin/nologin $OPTS $FLOOD_USER

exec su-exec $FLOOD_USER "$@"
