export interface TorrentTracker {
  index: number;
  id: string;
  url: string;
  type: number;
  group: number;
  minInterval: number;
  normalInterval: number;
}
