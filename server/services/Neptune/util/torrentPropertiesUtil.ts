import type {TorrentProperties} from '../../../../shared/types/Torrent';
import type {TorrentTracker} from '../../../../shared/types/TorrentTracker';
import {TorrentTrackerType} from '../../../../shared/types/TorrentTracker';
import type {NeptuneTorrentState} from '../neptune-client';

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
  state: NeptuneTorrentState,
  message = '',
  downRate = 0,
  upRate = 0,
): TorrentProperties['status'] => {
  const statuses: TorrentProperties['status'] = [];

  switch (state) {
    case 'Stopped':
      statuses.push('stopped');
      break;
    case 'Downloading':
      statuses.push('downloading');
      break;
    case 'Seeding':
      statuses.push('complete');
      statuses.push('seeding');
      break;
    case 'Checking':
      statuses.push('checking');
      break;
    case 'Moving':
      statuses.push('moving');
      break;
    case 'Error':
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
