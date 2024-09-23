export interface ExatorrentApiResponse {
  type: string;
}

export interface ExatorrentStatusApiResponse extends ExatorrentApiResponse {
  type: 'resp';
  state: 'success' | 'error';
  message: string;
  infohash: string;
}

export interface ExatorrentDataApiResponse extends ExatorrentApiResponse {
  data: object | object[] | string;
}

export interface ExatorrentNetworkStats {
  activehalfopenattempts: number;
  byteswritten: number;
  byteswrittendata: number;
  bytesread: number;
  bytesreaddata: number;
  bytesreadusefuldata: number;
  bytesreadusefulintendeddata: number;
  chunkswritten: number;
  chunksread: number;
  chunksreaduseful: number;
  chunksreadwasted: number;
  metadatachunksread: number;
}

export interface ExatorrentTorrentFile {
  path: string;
  displaypath: string;
  bytescompleted: number;
  length: number;
  priority: number;
  offset: number;
}

export interface ExatorrentPeerConn {
  remoteaddr: string;
  peerclientname: string;
  downloadrate: number;
  peerpreferencryption: boolean;
}

export interface ExatorrentTorrent {
  infohash: string;
  name: string;
  bytescompleted: number;
  byteswritten: number;
  length: number;
  state: string;
  seeding: boolean;
  private: boolean;
  creationdate: number;
  addeddate: number;
  starteddate: number;
  totalpeers: number;
  activepeers: number;
  connectedseeders: number;
  announcelist: string[];
}
