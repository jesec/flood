import {numberTransformer, stringTransformer, stringArrayTransformer} from '../../util/rTorrentMethodCallUtil';

const clientSettingMethodCallConfigs = {
  dht: {
    methodCall: 'dht.statistics',
    transformValue: (value: unknown): boolean => {
      const [stats] = value as Array<Record<string, string>>;
      return stats.dht !== 'disable';
    },
  },
  dhtPort: {
    methodCall: 'dht.port',
    transformValue: numberTransformer,
  },
  directoryDefault: {
    methodCall: 'directory.default',
    transformValue: stringTransformer,
  },
  networkHttpMaxOpen: {
    methodCall: 'network.http.max_open',
    transformValue: numberTransformer,
  },
  networkLocalAddress: {
    methodCall: 'network.local_address',
    transformValue: stringArrayTransformer,
  },
  networkMaxOpenFiles: {
    methodCall: 'network.max_open_files',
    transformValue: numberTransformer,
  },
  networkPortOpen: {
    methodCall: 'network.port_open',
    transformValue: (value: unknown) => {
      const [portOpen] = value as Array<string>;
      return portOpen === '1';
    },
  },
  networkPortRandom: {
    methodCall: 'network.port_random',
    transformValue: (value: unknown) => {
      const [portRandom] = value as Array<string>;
      return portRandom === '1';
    },
  },
  networkPortRange: {
    methodCall: 'network.port_range',
    transformValue: (value: unknown) => {
      const [portRange] = value as Array<string>;
      return portRange;
    },
  },
  piecesHashOnCompletion: {
    methodCall: 'pieces.hash.on_completion',
    transformValue: (value: unknown) => {
      const [hashOnCompletion] = value as Array<string>;
      return hashOnCompletion === '1';
    },
  },
  piecesMemoryMax: {
    methodCall: 'pieces.memory.max',
    transformValue: (value: unknown) => {
      return Number(value) / (1024 * 1024);
    },
  },
  protocolPex: {
    methodCall: 'protocol.pex',
    transformValue: (value: unknown) => {
      const [protocolPex] = value as Array<string>;
      return protocolPex === '1';
    },
  },
  throttleGlobalDownMax: {
    methodCall: 'throttle.global_down.max_rate',
    transformValue: (value: unknown) => {
      // B/s to Kb/s
      return Math.trunc(Number(value) / 1024);
    },
  },
  throttleGlobalUpMax: {
    methodCall: 'throttle.global_up.max_rate',
    transformValue: (value: unknown) => {
      // B/s to Kb/s
      return Math.trunc(Number(value) / 1024);
    },
  },
  throttleMaxPeersNormal: {
    methodCall: 'throttle.max_peers.normal',
    transformValue: numberTransformer,
  },
  throttleMaxPeersSeed: {
    methodCall: 'throttle.max_peers.seed',
    transformValue: numberTransformer,
  },
  throttleMaxDownloads: {
    methodCall: 'throttle.max_downloads',
    transformValue: numberTransformer,
  },
  throttleMaxDownloadsGlobal: {
    methodCall: 'throttle.max_downloads.global',
    transformValue: numberTransformer,
  },
  throttleMaxUploads: {
    methodCall: 'throttle.max_uploads',
    transformValue: numberTransformer,
  },
  throttleMaxUploadsGlobal: {
    methodCall: 'throttle.max_uploads.global',
    transformValue: numberTransformer,
  },
  throttleMinPeersNormal: {
    methodCall: 'throttle.min_peers.normal',
    transformValue: numberTransformer,
  },
  throttleMinPeersSeed: {
    methodCall: 'throttle.min_peers.seed',
    transformValue: numberTransformer,
  },
  trackersNumWant: {
    methodCall: 'trackers.numwant',
    transformValue: numberTransformer,
  },
} as const;

export default clientSettingMethodCallConfigs;
