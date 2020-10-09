import objectUtil from '../util/objectUtil';

export const clientSettingsMap = {
  dht: 'dht.mode',
  dhtPort: 'dht.port',
  dhtStats: 'dht.statistics',
  directoryDefault: 'directory.default',
  networkHttpMaxOpen: 'network.http.max_open',
  networkLocalAddress: 'network.local_address',
  networkMaxOpenFiles: 'network.max_open_files',
  networkPortOpen: 'network.port_open',
  networkPortRandom: 'network.port_random',
  networkPortRange: 'network.port_range',
  piecesHashOnCompletion: 'pieces.hash.on_completion',
  piecesMemoryMax: 'pieces.memory.max',
  protocolPex: 'protocol.pex',
  throttleGlobalDownMax: 'throttle.global_down.max_rate',
  throttleGlobalUpMax: 'throttle.global_up.max_rate',
  throttleMaxPeersNormal: 'throttle.max_peers.normal',
  throttleMaxPeersSeed: 'throttle.max_peers.seed',
  throttleMaxDownloads: 'throttle.max_downloads',
  throttleMaxDownloadsDiv: 'throttle.max_downloads.div',
  throttleMaxDownloadsGlobal: 'throttle.max_downloads.global',
  throttleMaxUploads: 'throttle.max_uploads',
  throttleMaxUploadsDiv: 'throttle.max_uploads.div',
  throttleMaxUploadsGlobal: 'throttle.max_uploads.global',
  throttleMinPeersNormal: 'throttle.min_peers.normal',
  throttleMinPeersSeed: 'throttle.min_peers.seed',
  trackersNumWant: 'trackers.numwant',
} as const;

// TODO: Is this bidirectional map really necessary?
export const clientSettingsBiMap = objectUtil.reflect(clientSettingsMap);

export type ClientSetting = keyof typeof clientSettingsMap;
export type ClientSettings = {
  // TODO: Need proper types for each property
  [property in ClientSetting]?: string | Record<string, unknown> | null;
};
