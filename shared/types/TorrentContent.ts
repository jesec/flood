export enum TorrentContentPriority {
  DO_NOT_DOWNLOAD = 0,
  NORMAL = 1,
  HIGH = 2,
}

export interface TorrentContent {
  index: number;
  path: string;
  filename: string;
  percentComplete: number;
  priority: TorrentContentPriority;
  sizeBytes: number;
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
    [fileName: string]: TorrentContent & {isSelected?: boolean};
  };
  directories?: {
    [directoryName: string]: TorrentContentSelectionTree;
  };
}
