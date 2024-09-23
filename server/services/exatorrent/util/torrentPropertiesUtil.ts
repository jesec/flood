import type {TorrentProperties} from '@shared/types/Torrent';
import {TorrentTrackerType} from '@shared/types/TorrentTracker';

import {ExatorrentTorrent} from '../types/ExatorrentCoreMethods';

export const getTorrentStatuses = (torrent: ExatorrentTorrent): TorrentProperties['status'] => {
  const result: TorrentProperties['status'] = [];

  switch (torrent.state) {
    case 'active':
      result.push('active');
      if (torrent.bytescompleted < torrent.length) {
        result.push('downloading');
      }
      break;
    case 'inactive':
      result.push('stopped');
      break;
    default:
      result.push('error');
      break;
  }

  if (torrent.bytescompleted === torrent.length) {
    result.push('complete');
    if (torrent.seeding) {
      result.push('seeding');
    }
  }

  return result;
};

export const getTrackerType = (tracker: string): TorrentTrackerType => {
  if (tracker.startsWith('http')) {
    return TorrentTrackerType.HTTP;
  } else if (tracker.startsWith('udp')) {
    return TorrentTrackerType.UDP;
  } else {
    return TorrentTrackerType.DHT;
  }
};
