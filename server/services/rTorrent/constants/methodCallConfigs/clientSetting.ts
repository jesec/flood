import {numberTransformer} from '../../util/rTorrentMethodCallUtil';

const clientSettingMethodCallConfigs = {
  dht: {
    methodCall: 'dht.statistics',
    transformValue: (value: unknown): boolean => {
      if (Array.isArray(value)) {
        const [stats] = value as Array<Record<string, string>>;
        return stats.dht !== 'disable';
      } else {
        return (value as {dht: string})?.dht !== 'disable';
      }
    },
  },
  dhtPort: {
    methodCall: 'dht.port',
    transformValue: numberTransformer,
  },
  directoryDefault: {
    methodCall: 'directory.default',
    transformValue: (value: unknown): string => {
      return typeof value === 'string' ? value : (value as Array<string>)?.[0];
    },
  },
  networkHttpMaxOpen: {
    methodCall: 'network.http.max_open',
    transformValue: numberTransformer,
  },
  networkLocalAddress: {
    methodCall: 'network.local_address',
    transformValue: (value: unknown): string[] => {
      return [typeof value === 'string' ? value : (value as Array<string>)?.[0]];
    },
  },
  networkMaxOpenFiles: {
    methodCall: 'network.max_open_files',
    transformValue: numberTransformer,
  },
  networkPortOpen: {
    methodCall: 'network.port_open',
    transformValue: (value: unknown): boolean => {
      return value == 1 || (value as Array<string>)?.[0] === '1';
    },
  },
  networkPortRandom: {
    methodCall: 'network.port_random',
    transformValue: (value: unknown): boolean => {
      return value == 1 || (value as Array<string>)?.[0] === '1';
    },
  },
  networkPortRange: {
    methodCall: 'network.port_range',
    transformValue: (value: unknown): string => {
      return typeof value === 'string' ? value : (value as Array<string>)?.[0];
    },
  },
  piecesHashOnCompletion: {
    methodCall: 'pieces.hash.on_completion',
    transformValue: (value: unknown): boolean => {
      return value == 1 || (value as Array<string>)?.[0] === '1';
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
    transformValue: (value: unknown): boolean => {
      return value == 1 || (value as Array<string>)?.[0] === '1';
    },
  },
  throttleGlobalDownSpeed: {
    methodCall: 'throttle.global_down.max_rate',
    transformValue: numberTransformer,
  },
  throttleGlobalUpSpeed: {
    methodCall: 'throttle.global_up.max_rate',
    transformValue: numberTransformer,
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
