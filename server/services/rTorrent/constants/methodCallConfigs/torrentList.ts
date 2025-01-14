import {getDomainsFromURLs} from '../../../../util/torrentPropertiesUtil';
import {booleanTransformer, numberTransformer, stringTransformer} from '../../util/rTorrentMethodCallUtil';

const torrentListMethodCallConfigs = {
  hash: {
    methodCall: 'd.hash=',
    transformValue: stringTransformer,
  },
  name: {
    methodCall: 'd.name=',
    transformValue: stringTransformer,
  },
  message: {
    methodCall: 'd.message=',
    transformValue: stringTransformer,
  },
  state: {
    methodCall: 'd.state=',
    transformValue: booleanTransformer,
  },
  comment: {
    methodCall: 'd.custom2=',
    transformValue: (value: unknown): string => {
      // ruTorrent sets VRS24mrkr as a comment prefix, so we use it as well for compatability
      if (value === '' || typeof value !== 'string' || !value.startsWith('VRS24mrker')) {
        return '';
      }

      return decodeURIComponent(value.substring(10));
    },
  },
  isActive: {
    methodCall: 'd.is_active=',
    transformValue: booleanTransformer,
  },
  isComplete: {
    methodCall: 'd.complete=',
    transformValue: booleanTransformer,
  },
  isPrivate: {
    methodCall: 'd.is_private=',
    transformValue: booleanTransformer,
  },
  isInitialSeeding: {
    methodCall: 'd.connection_seed=',
    transformValue: (value: unknown): boolean => {
      return value === 'initial_seed';
    },
  },
  isSequential: {
    methodCall: 'd.down.sequential=',
    transformValue: booleanTransformer,
  },
  isOpen: {
    methodCall: 'd.is_open=',
    transformValue: booleanTransformer,
  },
  isHashing: {
    methodCall: 'd.hashing=',
    transformValue: booleanTransformer,
  },
  priority: {
    methodCall: 'd.priority=',
    transformValue: numberTransformer,
  },
  upRate: {
    methodCall: 'd.up.rate=',
    transformValue: numberTransformer,
  },
  upTotal: {
    methodCall: 'd.up.total=',
    transformValue: numberTransformer,
  },
  downRate: {
    methodCall: 'd.down.rate=',
    transformValue: numberTransformer,
  },
  downTotal: {
    methodCall: 'd.down.total=',
    transformValue: numberTransformer,
  },
  ratio: {
    methodCall: 'd.ratio=',
    transformValue: (value: unknown): number => {
      return (value as number) / 1000;
    },
  },
  bytesDone: {
    methodCall: 'd.bytes_done=',
    transformValue: numberTransformer,
  },
  sizeBytes: {
    methodCall: 'd.size_bytes=',
    transformValue: numberTransformer,
  },
  directory: {
    methodCall: 'd.directory=',
    transformValue: stringTransformer,
  },
  dateAdded: {
    methodCall: 'd.custom=addtime',
    transformValue: numberTransformer,
  },
  dateCreated: {
    methodCall: 'd.creation_date=',
    transformValue: numberTransformer,
  },
  dateFinished: {
    methodCall: 'd.timestamp.finished=',
    transformValue: numberTransformer,
  },
  dateActive: {
    methodCall: 'd.timestamp.last_active=',
    transformValue: numberTransformer,
  },
  tags: {
    methodCall: 'd.custom1=',
    transformValue: (value: unknown): string[] => {
      if (value === '' || typeof value !== 'string') {
        return [];
      }

      return value
        .split(',')
        .sort()
        .map((tag) => decodeURIComponent(tag));
    },
  },
  trackerURIs: {
    methodCall: 'cat="$t.multicall=d.hash=,t.is_enabled=,t.url=,cat={|||}"',
    transformValue: (value: unknown): string[] => {
      if (typeof value !== 'string') {
        return [];
      }
      return getDomainsFromURLs(
        value.split('|||').reduce((trackers: Array<string>, tracker) => {
          // Only count enabled trackers
          if (tracker.charAt(0) === '0') {
            return trackers;
          }

          trackers.push(tracker.substr(1));

          return trackers;
        }, []),
      );
    },
  },
  seedsConnected: {
    methodCall: 'd.peers_complete=',
    transformValue: numberTransformer,
  },
  seedsTotal: {
    methodCall: 'cat="$t.multicall=d.hash=,t.scrape_complete=,cat={|||}"',
    transformValue: (value: unknown): number => {
      if (typeof value !== 'string') {
        return 0;
      }
      return Number(value.substr(0, value.indexOf('|||')));
    },
  },
  peersConnected: {
    methodCall: 'd.peers_accounted=',
    transformValue: numberTransformer,
  },
  peersTotal: {
    methodCall: 'cat="$t.multicall=d.hash=,t.scrape_incomplete=,cat={|||}"',
    transformValue: (value: unknown): number => {
      if (typeof value !== 'string') {
        return 0;
      }
      return Number(value.substr(0, value.indexOf('|||')));
    },
  },
} as const;

export default torrentListMethodCallConfigs;
