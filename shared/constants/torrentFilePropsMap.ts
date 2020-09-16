const torrentFilePropsMap = {
  props: ['path', 'pathComponents', 'priority', 'sizeBytes', 'sizeChunks', 'completedChunks'],
  methods: ['f.path=', 'f.path_components=', 'f.priority=', 'f.size_bytes=', 'f.size_chunks=', 'f.completed_chunks='],
};

export interface TorrentFileRPCResponse {
  index: number;
  path: string;
  pathComponents: Array<string>;
  priority: number;
  sizeBytes: number;
  sizeChunks: number;
  completedChunks: number;
}

export type TorrentFile = Omit<TorrentFileRPCResponse, 'pathComponents' | 'sizeChunks' | 'completedChunks'> & {
  filename: string;
  percentComplete: number;
};

export default torrentFilePropsMap;
