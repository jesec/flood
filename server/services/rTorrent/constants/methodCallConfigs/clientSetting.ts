import {numberTransformer, stringTransformer, stringArrayTransformer} from '../../util/rTorrentMethodCallUtil';

const clientSettingMethodCallConfigs = {
  dhtPort: {
    methodCall: 'dht.port',
    transformValue: numberTransformer,
  },
  dhtStats: {
    methodCall: 'dht.statistics',
    transformValue: (value: unknown) => {
      const [stats] = value as Array<Record<string, string>>;
      return {
        active: Number(stats.active),
        buckets: Number(stats.buckets),
        bytes_read: Number(stats.bytes_read),
        bytes_written: Number(stats.bytes_written),
        cycle: Number(stats.cycle),
        dht: stats.dht,
        errors_caught: Number(stats.errors_caught),
        errors_received: Number(stats.errors_received),
        nodes: Number(stats.nodes),
        peers: Number(stats.peers),
        peers_max: Number(stats.peers_max),
        queries_received: Number(stats.queries_received),
        queries_sent: Number(stats.queries_sent),
        replies_received: Number(stats.replies_received),
        throttle: Number(stats.throttle),
        torrents: Number(stats.torrents),
      };
    },
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
      return Number(value) / 1024;
    },
  },
  throttleGlobalUpMax: {
    methodCall: 'throttle.global_up.max_rate',
    transformValue: (value: unknown) => {
      return Number(value) / 1024;
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
  throttleMaxDownloadsDiv: {
    methodCall: 'throttle.max_downloads.div',
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
  throttleMaxUploadsDiv: {
    methodCall: 'throttle.max_uploads.div',
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
