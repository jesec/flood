'use strict';

const torrentFilePropsMap = {
  props: ['path', 'pathComponents', 'priority', 'sizeBytes', 'sizeChunks', 'completedChunks'],
  methods: ['f.path=', 'f.path_components=', 'f.priority=', 'f.size_bytes=', 'f.size_chunks=', 'f.completed_chunks='],
};

module.exports = torrentFilePropsMap;
