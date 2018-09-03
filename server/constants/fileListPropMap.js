const fileListPropMap = new Map();
const defaultTransformer = value => value;

fileListPropMap.set('path', {
  methodCall: 'f.path=',
  transformValue: defaultTransformer,
});

fileListPropMap.set('pathComponents', {
  methodCall: 'f.path_components=',
  transformValue: defaultTransformer,
});

fileListPropMap.set('priority', {
  methodCall: 'f.priority=',
  transformValue: defaultTransformer,
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

module.exports = fileListPropMap;
