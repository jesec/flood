export interface TorrentPeer {
  address: string;
  country: string;
  clientVersion: string;
  completedPercent: number;
  downloadRate: number;
  uploadRate: number;
  isEncrypted: boolean;
  isIncoming: boolean;
}
