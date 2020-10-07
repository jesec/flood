export interface TorrentContent {
  index: number;
  path: string;
  filename: string;
  percentComplete: number;
  priority: number;
  sizeBytes: number;
}

export interface TorrentContentTree {
  files?: Array<TorrentContent>;
  directories?: {
    [directoryName: string]: TorrentContentTree;
  };
}

export interface TorrentContentSelection {
  type: 'file' | 'directory';
  depth: number;
  path: Array<string>;
  select: boolean;
}

export interface TorrentContentSelectionTree {
  isSelected?: boolean;
  files?: {
    [fileName: string]: TorrentContent & {isSelected: boolean};
  };
  directories?: {
    [directoryName: string]: TorrentContentSelectionTree;
  };
}
