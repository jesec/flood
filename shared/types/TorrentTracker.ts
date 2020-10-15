export enum TorrentTrackerType {
  HTTP = 1,
  UDP = 2,
  DHT = 3,
}

export interface TorrentTracker {
  index: number;
  id: string;
  url: string;
  type: TorrentTrackerType;
  group: number;
  minInterval: number;
  normalInterval: number;
  isEnabled: boolean;
}
