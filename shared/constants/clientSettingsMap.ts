import objectUtil from '../util/objectUtil';

export const clientSettingsMap = {
  dht: 'dht.mode',
  dhtPort: 'dht.port',
  dhtStats: 'dht.statistics',
  directoryDefault: 'directory.default',
  maxFileSize: 'system.file.max_size',
  networkBindAddress: 'network.bind_address',
  networkHttpCert: 'network.http.cacert',
  networkHttpMaxOpen: 'network.http.max_open',
  networkHttpPath: 'network.http.capath',
  networkHttpProxy: 'network.http.proxy_address',
  networkLocalAddress: 'network.local_address',
  networkMaxOpenFiles: 'network.max_open_files',
  networkMaxOpenSockets: 'network.max_open_sockets',
  networkPortOpen: 'network.port_open',
  networkPortRandom: 'network.port_random',
  networkPortRange: 'network.port_range',
  networkReceiveBufferSize: 'network.receive_buffer.size',
  networkScgiDontRoute: 'network.scgi.dont_route',
  networkSendBufferSize: 'network.send_buffer.size',
  piecesHashOnCompletion: 'pieces.hash.on_completion',
  piecesMemoryMax: 'pieces.memory.max',
  piecesPreloadMinRate: 'pieces.preload.min_rate',
  piecesPreloadMinSize: 'pieces.preload.min_size',
  piecesPreloadType: 'pieces.preload.type',
  piecesSyncAlwaysSafe: 'pieces.sync.always_safe',
  piecesSyncTimeout: 'pieces.sync.timeout',
  piecesSyncTimeoutSafe: 'pieces.sync.timeout_safe',
  protocolPex: 'protocol.pex',
  sessionOnCompletion: 'session.on_completion',
  sessionPath: 'session.path',
  sessionUseLock: 'session.use_lock',
  systemFileSplitSize: 'system.file.split_size',
  systemFileSplitSuffix: 'system.file.split_suffix',
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
  trackersUseUdp: 'trackers.use_udp',
} as const;

// TODO: Is this bidirectional map really necessary?
export const clientSettingsBiMap = objectUtil.reflect(clientSettingsMap);

export type ClientSetting = keyof typeof clientSettingsMap;
export type ClientSettings = {
  // TODO: Need proper types for each property
  [property in ClientSetting]?: string | Record<string, unknown> | null;
};
