const torrentStatusMap = [
  'downloading',
  'seeding',
  'checking',
  'complete',
  'stopped',
  'active',
  'inactive',
  'error',
] as const;

export type TorrentStatus = (typeof torrentStatusMap)[number];
export default torrentStatusMap;
