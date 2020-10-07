import regEx from '../../../shared/util/regEx';
import {stringTransformer, booleanTransformer, numberTransformer} from '../../util/rTorrentMethodCallUtil';

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
    transformValue: stringTransformer,
  },
  isActive: {
    methodCall: 'd.is_active=',
    transformValue: booleanTransformer,
  },
  isComplete: {
    methodCall: 'd.complete=',
    transformValue: booleanTransformer,
  },
  isMultiFile: {
    methodCall: 'd.is_multi_file=',
    transformValue: booleanTransformer,
  },
  isPrivate: {
    methodCall: 'd.is_private=',
    transformValue: booleanTransformer,
  },
  isOpen: {
    methodCall: 'd.is_open=',
    transformValue: booleanTransformer,
  },
  isHashing: {
    methodCall: 'd.hashing=',
    transformValue: (value: unknown): boolean => {
      return value !== '0';
    },
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
    transformValue: numberTransformer,
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
  basePath: {
    methodCall: 'd.base_path=',
    transformValue: stringTransformer,
  },
  baseFilename: {
    methodCall: 'd.base_filename=',
    transformValue: stringTransformer,
  },
  baseDirectory: {
    methodCall: 'd.directory_base=',
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

      const trackers = value.split('|||');
      const trackerDomains: Array<string> = [];

      trackers.forEach((tracker) => {
        // Only count enabled trackers
        if (tracker.charAt(0) === '0') {
          return;
        }

        const regexMatched = regEx.domainName.exec(tracker.substr(1));

        if (regexMatched != null && regexMatched[1]) {
          let domain = regexMatched[1];

          const minSubsetLength = 3;
          const domainSubsets = domain.split('.');
          let desiredSubsets = 2;

          if (domainSubsets.length > desiredSubsets) {
            const lastDesiredSubset = domainSubsets[domainSubsets.length - desiredSubsets];
            if (lastDesiredSubset.length <= minSubsetLength) {
              desiredSubsets += 1;
            }
          }

          domain = domainSubsets.slice(desiredSubsets * -1).join('.');

          trackerDomains.push(domain);
        }
      });

      // Deduplicate
      return [...new Set(trackerDomains)];
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
