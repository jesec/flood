const torrentStatusMap = [
  'checking',
  'seeding',
  'paused',
  'complete',
  'downloading',
  'stopped',
  'error',
  'inactive',
  'active',
] as const;

export type TorrentStatus = typeof torrentStatusMap[number];
export default torrentStatusMap;
