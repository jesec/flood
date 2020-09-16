const fileListPropMap = new Map();

fileListPropMap.set('path', {
  methodCall: 'f.path=',
});

fileListPropMap.set('pathComponents', {
  methodCall: 'f.path_components=',
});

fileListPropMap.set('priority', {
  methodCall: 'f.priority=',
});

fileListPropMap.set('sizeBytes', {
  methodCall: 'f.size_bytes=',
  transformValue: Number,
});

fileListPropMap.set('sizeChunks', {
  methodCall: 'f.size_chunks=',
  transformValue: Number,
});

fileListPropMap.set('completedChunks', {
  methodCall: 'f.completed_chunks=',
  transformValue: Number,
});

export default fileListPropMap;
