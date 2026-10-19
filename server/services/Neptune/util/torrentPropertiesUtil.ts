import {TorrentState} from '@trim21/neptune';

import type {TorrentProperties} from '../../../../shared/types/Torrent';
import type {TorrentTracker} from '../../../../shared/types/TorrentTracker';
import {TorrentTrackerType} from '../../../../shared/types/TorrentTracker';

export const getTorrentTrackerTypeFromURL = (url: string): TorrentTracker['type'] => {
  if (url.startsWith('http')) {
    return TorrentTrackerType.HTTP;
  }

  if (url.startsWith('udp')) {
    return TorrentTrackerType.UDP;
  }

  return TorrentTrackerType.DHT;
};

export const getTorrentStatusFromState = (
  state: (typeof TorrentState)[keyof typeof TorrentState],
  message = '',
  downRate = 0,
  upRate = 0,
): TorrentProperties['status'] => {
  const statuses: TorrentProperties['status'] = [];

  switch (state) {
    case TorrentState.Downloading:
    case TorrentState.PendingDownloading:
      statuses.push('downloading');
      break;
    case TorrentState.Seeding:
      statuses.push('complete');
      statuses.push('seeding');
      break;
    case TorrentState.Checking:
      statuses.push('checking');
      break;
    case TorrentState.Stopped:
      statuses.push('stopped');
      break;
    case TorrentState.Moving:
      statuses.push('moving');
      break;
    case TorrentState.Error:
      statuses.push('error');
      statuses.push('stopped');
      break;
    default:
      break;
  }

  if (downRate !== 0 || upRate !== 0) {
    statuses.push('active');
  } else {
    statuses.push('inactive');
  }

  if (message.length > 0) {
    statuses.push('warning');
  }

  return statuses;
};
