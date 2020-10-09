export interface DHTStats {
  active: number;
  buckets: number;
  bytes_read: number;
  bytes_written: number;
  cycle: number;
  errors_caught: number;
  errors_received: number;
  nodes: number;
  peers: number;
  peers_max: number;
  queries_received: number;
  queries_sent: number;
  replies_received: number;
  throttle: number | '';
  torrents: number;
}

export interface ClientSettings {
  dht: boolean;
  dhtPort: number;
  dhtStats: DHTStats;
  directoryDefault: string;
  networkHttpMaxOpen: number;
  networkLocalAddress: Array<string>;
  networkMaxOpenFiles: number;
  networkPortOpen: boolean;
  networkPortRandom: boolean;
  networkPortRange: string;
  piecesHashOnCompletion: boolean;
  piecesMemoryMax: number;
  protocolPex: boolean;
  throttleGlobalDownMax: number;
  throttleGlobalUpMax: number;
  throttleMaxPeersNormal: number;
  throttleMaxPeersSeed: number;
  throttleMaxDownloads: number;
  throttleMaxDownloadsDiv: number;
  throttleMaxDownloadsGlobal: number;
  throttleMaxUploads: number;
  throttleMaxUploadsDiv: number;
  throttleMaxUploadsGlobal: number;
  throttleMinPeersNormal: number;
  throttleMinPeersSeed: number;
  trackersNumWant: number;
}

export type ClientSetting = keyof ClientSettings;
