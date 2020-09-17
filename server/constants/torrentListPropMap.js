import regEx from '../../shared/util/regEx';

const torrentListPropMap = new Map();

const booleanTransformer = (value) => value === '1';
const dateTransformer = (dirtyDate) => {
  if (!dirtyDate) {
    return '';
  }

  const date = dirtyDate.trim();

  if (date === '0') {
    return '';
  }

  return date;
};

torrentListPropMap.set('hash', {
  methodCall: 'd.hash=',
});

torrentListPropMap.set('name', {
  methodCall: 'd.name=',
});

torrentListPropMap.set('message', {
  methodCall: 'd.message=',
});

torrentListPropMap.set('state', {
  methodCall: 'd.state=',
});

torrentListPropMap.set('isStateChanged', {
  methodCall: 'd.state_changed=',
  transformValue: booleanTransformer,
});

torrentListPropMap.set('isActive', {
  methodCall: 'd.is_active=',
  transformValue: booleanTransformer,
});

torrentListPropMap.set('isComplete', {
  methodCall: 'd.complete=',
  transformValue: booleanTransformer,
});

torrentListPropMap.set('isHashing', {
  methodCall: 'd.hashing=',
});

torrentListPropMap.set('isOpen', {
  methodCall: 'd.is_open=',
  transformValue: booleanTransformer,
});

torrentListPropMap.set('priority', {
  methodCall: 'd.priority=',
});

torrentListPropMap.set('upRate', {
  methodCall: 'd.up.rate=',
  transformValue: Number,
});

torrentListPropMap.set('upTotal', {
  methodCall: 'd.up.total=',
  transformValue: Number,
});

torrentListPropMap.set('downRate', {
  methodCall: 'd.down.rate=',
  transformValue: Number,
});

torrentListPropMap.set('downTotal', {
  methodCall: 'd.down.total=',
  transformValue: Number,
});

torrentListPropMap.set('ratio', {
  methodCall: 'd.ratio=',
  transformValue: Number,
});

torrentListPropMap.set('bytesDone', {
  methodCall: 'd.bytes_done=',
  transformValue: Number,
});

torrentListPropMap.set('sizeBytes', {
  methodCall: 'd.size_bytes=',
  transformValue: Number,
});

torrentListPropMap.set('directory', {
  methodCall: 'd.directory=',
});

torrentListPropMap.set('basePath', {
  methodCall: 'd.base_path=',
});

torrentListPropMap.set('baseFilename', {
  methodCall: 'd.base_filename=',
});

torrentListPropMap.set('baseDirectory', {
  methodCall: 'd.directory_base=',
});

torrentListPropMap.set('seedingTime', {
  methodCall: 'd.custom=seedingtime',
});

torrentListPropMap.set('dateAdded', {
  methodCall: 'd.custom=addtime',
  transformValue: dateTransformer,
});

torrentListPropMap.set('dateCreated', {
  methodCall: 'd.creation_date=',
  transformValue: dateTransformer,
});

torrentListPropMap.set('throttleName', {
  methodCall: 'd.throttle_name=',
});

torrentListPropMap.set('isMultiFile', {
  methodCall: 'd.is_multi_file=',
  transformValue: booleanTransformer,
});

torrentListPropMap.set('isPrivate', {
  methodCall: 'd.is_private=',
  transformValue: booleanTransformer,
});

torrentListPropMap.set('tags', {
  methodCall: 'd.custom1=',
  transformValue: (value) => {
    if (value === '') {
      return [];
    }

    return value
      .split(',')
      .sort()
      .map((tag) => decodeURIComponent(tag));
  },
});

torrentListPropMap.set('comment', {
  methodCall: 'd.custom2=',
  transformValue: (value) => {
    let comment = decodeURIComponent(value);

    if (comment.match(/^VRS24mrker/)) {
      comment = comment.substr(10);
    }

    return comment;
  },
});

torrentListPropMap.set('ignoreScheduler', {
  methodCall: 'd.custom=sch_ignore',
  transformValue: booleanTransformer,
});

torrentListPropMap.set('trackerURIs', {
  methodCall: 'cat="$t.multicall=d.hash=,t.is_enabled=,t.url=,cat={|||}"',
  transformValue: (value) => {
    const trackers = value.split('|||');
    const trackerDomains = [];

    trackers.forEach((tracker) => {
      // Only count enabled trackers
      if (tracker.charAt(0) === '0') {
        return;
      }

      let domain = regEx.domainName.exec(tracker.substr(1));

      if (domain && domain[1]) {
        domain = domain[1];

        const minSubsetLength = 3;
        const domainSubsets = domain.split('.');
        let desiredSubsets = 2;

        if (domainSubsets.length > desiredSubsets) {
          const lastDesiredSubset = domainSubsets[domainSubsets.length - desiredSubsets];
          if (lastDesiredSubset.length <= minSubsetLength) {
            desiredSubsets++;
          }
        }

        domain = domainSubsets.slice(desiredSubsets * -1).join('.');

        trackerDomains.push(domain);
      }
    });

    // Deduplicate
    return [...new Set(trackerDomains)];
  },
});

torrentListPropMap.set('seedsConnected', {
  methodCall: 'd.peers_complete=',
  transformValue: Number,
});

torrentListPropMap.set('seedsTotal', {
  methodCall: 'cat="$t.multicall=d.hash=,t.scrape_complete=,cat={|||}"',
  transformValue: (value) => Number(value.substr(0, value.indexOf('|||'))),
});

torrentListPropMap.set('peersConnected', {
  methodCall: 'd.peers_accounted=',
  transformValue: Number,
});

torrentListPropMap.set('peersTotal', {
  methodCall: 'cat="$t.multicall=d.hash=,t.scrape_incomplete=,cat={|||}"',
  transformValue: (value) => Number(value.substr(0, value.indexOf('|||'))),
});

export default torrentListPropMap;
