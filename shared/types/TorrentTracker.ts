export enum TorrentTrackerType {
  HTTP = 1,
  UDP = 2,
  DHT = 3,
}

export interface TorrentTracker {
  url: string;
  type: TorrentTrackerType;
}
