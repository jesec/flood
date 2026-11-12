export enum TorrentTrackerType {
  HTTP = 1,
  UDP = 2,
  DHT = 3,
}

export interface TorrentTracker {
  url: string;
  type: TorrentTrackerType;
  // Whether the tracker is enabled. Left undefined if the client does not support enabling/disabling trackers.
  isEnabled?: boolean;
}
