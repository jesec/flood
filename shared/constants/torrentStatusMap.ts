const torrentStatusMap = [
  'downloading',
  'seeding',
  'checking',
  'complete',
  'stopped',
  'active',
  'inactive',
  'warning',
  'error',
  'moving',
] as const;

export type TorrentStatus = (typeof torrentStatusMap)[number];
export default torrentStatusMap;
