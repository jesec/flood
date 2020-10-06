import {defaultTransformer, booleanTransformer, numberTransformer} from './rTorrentMethodCall';
import regEx from '../../shared/util/regEx';

const torrentListMethodCallConfigs = [
  {
    propLabel: 'hash',
    methodCall: 'd.hash=',
    transformValue: defaultTransformer,
  },
  {
    propLabel: 'name',
    methodCall: 'd.name=',
    transformValue: defaultTransformer,
  },
  {
    propLabel: 'message',
    methodCall: 'd.message=',
    transformValue: defaultTransformer,
  },
  {
    propLabel: 'state',
    methodCall: 'd.state=',
    transformValue: defaultTransformer,
  },
  {
    propLabel: 'isStateChanged',
    methodCall: 'd.state_changed=',
    transformValue: booleanTransformer,
  },
  {
    propLabel: 'isActive',
    methodCall: 'd.is_active=',
    transformValue: booleanTransformer,
  },
  {
    propLabel: 'isComplete',
    methodCall: 'd.complete=',
    transformValue: booleanTransformer,
  },
  {
    propLabel: 'isHashing',
    methodCall: 'd.hashing=',
    transformValue: defaultTransformer,
  },
  {
    propLabel: 'isOpen',
    methodCall: 'd.is_open=',
    transformValue: booleanTransformer,
  },
  {
    propLabel: 'priority',
    methodCall: 'd.priority=',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'upRate',
    methodCall: 'd.up.rate=',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'upTotal',
    methodCall: 'd.up.total=',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'downRate',
    methodCall: 'd.down.rate=',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'downTotal',
    methodCall: 'd.down.total=',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'ratio',
    methodCall: 'd.ratio=',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'bytesDone',
    methodCall: 'd.bytes_done=',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'sizeBytes',
    methodCall: 'd.size_bytes=',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'directory',
    methodCall: 'd.directory=',
    transformValue: defaultTransformer,
  },
  {
    propLabel: 'basePath',
    methodCall: 'd.base_path=',
    transformValue: defaultTransformer,
  },
  {
    propLabel: 'baseFilename',
    methodCall: 'd.base_filename=',
    transformValue: defaultTransformer,
  },
  {
    propLabel: 'baseDirectory',
    methodCall: 'd.directory_base=',
    transformValue: defaultTransformer,
  },
  {
    propLabel: 'seedingTime',
    methodCall: 'd.custom=seedingtime',
    transformValue: defaultTransformer,
  },
  {
    propLabel: 'dateAdded',
    methodCall: 'd.custom=addtime',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'dateCreated',
    methodCall: 'd.creation_date=',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'throttleName',
    methodCall: 'd.throttle_name=',
    transformValue: defaultTransformer,
  },
  {
    propLabel: 'isMultiFile',
    methodCall: 'd.is_multi_file=',
    transformValue: booleanTransformer,
  },
  {
    propLabel: 'isPrivate',
    methodCall: 'd.is_private=',
    transformValue: booleanTransformer,
  },
  {
    propLabel: 'tags',
    methodCall: 'd.custom1=',
    transformValue: (value: string) => {
      if (value === '') {
        return [];
      }

      return value
        .split(',')
        .sort()
        .map((tag) => decodeURIComponent(tag));
    },
  },
  {
    propLabel: 'comment',
    methodCall: 'd.custom2=',
    transformValue: (value: string) => {
      let comment = decodeURIComponent(value);

      if (comment.match(/^VRS24mrker/)) {
        comment = comment.substr(10);
      }

      return comment;
    },
  },
  {
    propLabel: 'trackerURIs',
    methodCall: 'cat="$t.multicall=d.hash=,t.is_enabled=,t.url=,cat={|||}"',
    transformValue: (value: string) => {
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
  {
    propLabel: 'seedsConnected',
    methodCall: 'd.peers_complete=',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'seedsTotal',
    methodCall: 'cat="$t.multicall=d.hash=,t.scrape_complete=,cat={|||}"',
    transformValue: (value: string) => Number(value.substr(0, value.indexOf('|||'))),
  },
  {
    propLabel: 'peersConnected',
    methodCall: 'd.peers_accounted=',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'peersTotal',
    methodCall: 'cat="$t.multicall=d.hash=,t.scrape_incomplete=,cat={|||}"',
    transformValue: (value: string) => Number(value.substr(0, value.indexOf('|||'))),
  },
] as const;

export default torrentListMethodCallConfigs;
