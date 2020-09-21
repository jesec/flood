// Strings are Buffers from bencode data structure point of view.
// Timestamp is in second.

export interface TorrentFile {
  announce: Buffer; // main tracker
  'announce-list'?: Array<Array<Buffer>>; // multi tracker torrent
  comment?: Buffer;
  'created by': Buffer;
  'creation date': number; // timestamp
  encoding?: Buffer;
  info: {
    length?: number; // single file torrent
    files?: Array<{
      length: number;
      path: Array<Buffer>;
    }>; // multi file torrent
    name: Buffer;
    'piece length': number;
    pieces: Buffer; // hash tree, NOT string
    private?: 0 | 1;
    source?: Buffer;
  };
}

export enum LibTorrentFilePriority {
  OFF = 0,
  NORMAL = 1,
  HIGH = 2,
}

export interface LibTorrentResume {
  bitfield: number;
  files: Array<{
    completed: number; // number of completed pieces
    mtime: number; // timestamp
    priority: LibTorrentFilePriority;
  }>;
  peers?: Array<{
    failed: 0 | 1;
    inet: Buffer; // encoded IP address, NOT string
    last: number; // timestamp
  }>;
  trackers?: {
    [url: string]: {
      enabled: 0 | 1;
    };
  };
  'uncertain_pieces.timestamp'?: number; // timestamp
}

export interface RTorrentSession {
  chunks_done: number;
  chunks_wanted: number;
  complete: 0 | 1;
  directory: Buffer;
  // 0: No hashing is happening.
  // 1: The very first hash check is occurring.
  // 2: The torrent is in the middle of hashing due to the finish event.
  // 3: A rehash is occurring.
  hashing: 0 | 1 | 2 | 3;
  state: 0 | 1;
  state_changed: number; // timestamp
  state_counter: number;
  tied_to_file: Buffer;
  'timestamp.finished': number; // timestamp
  'timestamp.started': number; // timestamp
}

export interface RTorrentFile extends TorrentFile {
  libtorrent_resume?: LibTorrentResume;
  rtorrent?: RTorrentSession;
}
