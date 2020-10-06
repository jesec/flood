import {defaultTransformer, numberTransformer} from './rTorrentMethodCall';

const fileListMethodCallConfigs = [
  {
    propLabel: 'path',
    methodCall: 'f.path=',
    transformValue: defaultTransformer,
  },
  {
    propLabel: 'pathComponents',
    methodCall: 'f.path_components=',
    transformValue: defaultTransformer,
  },
  {
    propLabel: 'priority',
    methodCall: 'f.priority=',
    transformValue: defaultTransformer,
  },
  {
    propLabel: 'sizeBytes',
    methodCall: 'f.size_bytes=',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'sizeChunks',
    methodCall: 'f.size_chunks=',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'completedChunks',
    methodCall: 'f.completed_chunks=',
    transformValue: numberTransformer,
  },
] as const;

export default fileListMethodCallConfigs;
