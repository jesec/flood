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

export interface ExatorrentClientStats {
  bytes_written: number;
  bytes_written_data: number;
  bytes_read: number;
  bytes_read_data: number;
  bytes_read_useful_data: number;
  bytes_read_useful_intended_data: number;
  chunks_written: number;
  chunks_read: number;
  chunks_read_useful: number;
  chunks_read_wasted: number;
  metadata_chunks_read: number;
  pieces_dirtied_good: number;
  pieces_dirtied_bad: number;
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
  Network: string;
  RemoteAddr: {IP: string; Port: number; Zone: string};
  Discovery: string;
  PeerPreferEncryption: boolean;
  PeerMaxRequests: number;
  PeerID: number[];
  PeerExtensionsBytes: number[];
  PeerListenPort: number;
  LocalLtepProtocolMap: {Index: string[]; NumBuiltin: number};
  PeerExtensionsIDs: Map<string, number>;
  PeerClientName: string;
}

export interface ExatorrentTorrent {
  infohash: string;
  name: string;
  bytescompleted: number;
  length: number;
  state: string;
  seeding: boolean;
}
