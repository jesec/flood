const torrentStatusMap = [
  'checking',
  'seeding',
  'paused',
  'complete',
  'downloading',
  'activelyDownloading',
  'activelyUploading',
  'stopped',
  'error',
  'inactive',
  'active',
] as const;

export type TorrentStatus = typeof torrentStatusMap[number];
export default torrentStatusMap;
