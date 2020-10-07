export interface TorrentPeer {
  country: string;
  address: string;
  completedPercent: number;
  clientVersion: string;
  downloadRate: number;
  downloadTotal: number;
  uploadRate: number;
  uploadTotal: number;
  id: string;
  peerRate: number;
  peerTotal: number;
  isEncrypted: boolean;
  isIncoming: boolean;
}
