const regEx = require('../../shared/util/regEx');

const torrentListPropMap = new Map();

const cleanUpDate = dirtyDate => {
  if (!dirtyDate) {
    return '';
  }

  const date = dirtyDate.trim();

  if (date === '0') {
    return '';
  }

  return date;
};

torrentListPropMap.set(
  'hash',
  {
    methodCall: 'd.hash=',
    transformValue: value => value
  }
);

torrentListPropMap.set(
  'name',
  {
    methodCall: 'd.name=',
    transformValue: value => value
  }
);

torrentListPropMap.set(
  'message',
  {
    methodCall: 'd.message=',
    transformValue: value => value
  }
);

torrentListPropMap.set(
  'state',
  {
    methodCall: 'd.state=',
    transformValue: value => value
  }
);

torrentListPropMap.set(
  'isStateChanged',
  {
    methodCall: 'd.state_changed=',
    transformValue: value => value === '1'
  }
);

torrentListPropMap.set(
  'isActive',
  {
    methodCall: 'd.is_active=',
    transformValue: value => value === '1'
  }
);

torrentListPropMap.set(
  'isComplete',
  {
    methodCall: 'd.complete=',
    transformValue: value => value === '1'
  }
);

torrentListPropMap.set(
  'isHashChecking',
  {
    methodCall: 'd.is_hash_checking=',
    transformValue: value => value === '1'
  }
);

torrentListPropMap.set(
  'isOpen',
  {
    methodCall: 'd.is_open=',
    transformValue: value => value === '1'
  }
);

torrentListPropMap.set(
  'priority',
  {
    methodCall: 'd.priority=',
    transformValue: value => value
  }
);

torrentListPropMap.set(
  'upRate',
  {
    methodCall: 'd.up.rate=',
    transformValue: value => Number(value)
  }
);

torrentListPropMap.set(
  'upTotal',
  {
    methodCall: 'd.up.total=',
    transformValue: value => Number(value)
  }
);

torrentListPropMap.set(
  'downRate',
  {
    methodCall: 'd.down.rate=',
    transformValue: value => Number(value)
  }
);

torrentListPropMap.set(
  'downTotal',
  {
    methodCall: 'd.down.total=',
    transformValue: value => Number(value)
  }
);

torrentListPropMap.set(
  'ratio',
  {
    methodCall: 'd.ratio=',
    transformValue: value => Number(value)
  }
);

torrentListPropMap.set(
  'bytesDone',
  {
    methodCall: 'd.bytes_done=',
    transformValue: value => Number(value)
  }
);

torrentListPropMap.set(
  'sizeBytes',
  {
    methodCall: 'd.size_bytes=',
    transformValue: value => Number(value)
  }
);

torrentListPropMap.set(
  'peersConnected',
  {
    methodCall: 'd.peers_connected=',
    transformValue: value => Number(value)
  }
);

torrentListPropMap.set(
  'directory',
  {
    methodCall: 'd.directory=',
    transformValue: value => value
  }
);

torrentListPropMap.set(
  'basePath',
  {
    methodCall: 'd.base_path=',
    transformValue: value => value
  }
);

torrentListPropMap.set(
  'baseFilename',
  {
    methodCall: 'd.base_filename=',
    transformValue: value => value
  }
);

torrentListPropMap.set(
  'baseDirectory',
  {
    methodCall: 'd.directory_base=',
    transformValue: value => value
  }
);

torrentListPropMap.set(
  'seedingTime',
  {
    methodCall: 'd.custom=seedingtime',
    transformValue: value => value
  }
);

torrentListPropMap.set(
  'dateAdded',
  {
    methodCall: 'd.custom=addtime',
    transformValue: value => cleanUpDate(value)
  }
);

torrentListPropMap.set(
  'dateCreated',
  {
    methodCall: 'd.creation_date=',
    transformValue: value => cleanUpDate(value)
  }
);

torrentListPropMap.set(
  'throttleName',
  {
    methodCall: 'd.throttle_name=',
    transformValue: value => value
  }
);

torrentListPropMap.set(
  'isMultiFile',
  {
    methodCall: 'd.is_multi_file=',
    transformValue: value => value === '1'
  }
);

torrentListPropMap.set(
  'isPrivate',
  {
    methodCall: 'd.is_private=',
    transformValue: value => value === '1'
  }
);

torrentListPropMap.set(
  'tags',
  {
    methodCall: 'd.custom1=',
    transformValue: value => {
      if (value === '') {
        return [];
      }

      return value.split(',').sort().map((tag) => {
        return decodeURIComponent(tag);
      });
    }
  }
);

torrentListPropMap.set(
  'comment',
  {
    methodCall: 'd.custom2=',
    transformValue: value => {
      let comment = decodeURIComponent(value);

      if (comment.match(/^VRS24mrker/)) {
        comment = comment.substr(10);
      }

      return comment;
    }
  }
);

torrentListPropMap.set(
  'ignoreScheduler',
  {
    methodCall: 'd.custom=sch_ignore',
    transformValue: value => value === '1'
  }
);

torrentListPropMap.set(
  'trackerURIs',
  {
    methodCall: 'cat="$t.multicall=d.hash=,t.url=,cat={|||}"',
    transformValue: value => {
      const trackers = value.split('|||');
      const trackerDomains = [];

      trackers.forEach((tracker) => {
        let domain = regEx.domainName.exec(tracker);

        if (domain && domain[1]) {
          domain = domain[1];

          const minSubsetLength = 3;
          const domainSubsets = domain.split('.');
          let desiredSubsets = 2;

          if (domainSubsets.length > desiredSubsets) {
            let lastDesiredSubset = domainSubsets[domainSubsets.length - desiredSubsets];
            if (lastDesiredSubset.length <= minSubsetLength) {
              desiredSubsets++;
            }
          }

          domain = domainSubsets.slice(desiredSubsets * -1).join('.');

          trackerDomains.push(domain);
        }
      });

      return trackerDomains;
    }
  }
);

torrentListPropMap.set(
  'seedsConnected',
  {
    methodCall: 'd.peers_complete=',
    transformValue: value => Number(value)
  }
);

torrentListPropMap.set(
  'seedsTotal',
  {
    methodCall: 'cat="$t.multicall=d.hash=,t.scrape_complete=,cat={|||}"',
    transformValue: value => {
      return Number(value.substr(0, value.indexOf('|||')));
    }
  }
);

torrentListPropMap.set(
  'peersConnected',
  {
    methodCall: 'd.peers_accounted=',
    transformValue: value => Number(value)
  }
);

torrentListPropMap.set(
  'peersTotal',
  {
    methodCall: 'cat="$t.multicall=d.hash=,t.scrape_incomplete=,cat={|||}"',
    transformValue: value => {
      return Number(value.substr(0, value.indexOf('|||')));
    }
  }
);

module.exports = torrentListPropMap;
