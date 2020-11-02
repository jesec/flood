const torrentStatusMap = [
  'checking',
  'seeding',
  'complete',
  'downloading',
  'stopped',
  'error',
  'inactive',
  'active',
] as const;

export type TorrentStatus = typeof torrentStatusMap[number];
export default torrentStatusMap;
