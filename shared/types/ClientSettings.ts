export interface ClientSettings {
  dht: boolean;
  dhtPort: number;
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
  // B/s
  throttleGlobalDownSpeed: number;
  // B/s
  throttleGlobalUpSpeed: number;
  throttleMaxPeersNormal: number;
  throttleMaxPeersSeed: number;
  throttleMaxDownloads: number;
  throttleMaxDownloadsGlobal: number;
  throttleMaxUploads: number;
  throttleMaxUploadsGlobal: number;
  throttleMinPeersNormal: number;
  throttleMinPeersSeed: number;
  trackersNumWant: number;
}

export type ClientSetting = keyof ClientSettings;
