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

export const getTorrentStatusFromState = (state: NeptuneTorrentState, message = ''): TorrentProperties['status'] => {
  const statuses: TorrentProperties['status'] = [];

  switch (state) {
    case 'Stopped':
      statuses.push('inactive');
      statuses.push('stopped');
      break;
    case 'Downloading':
      statuses.push('active');
      statuses.push('downloading');
      break;
    case 'Seeding':
      statuses.push('complete');
      statuses.push('active');
      statuses.push('seeding');
      break;
    case 'Checking':
      statuses.push('active');
      statuses.push('checking');
      break;
    case 'Moving':
      statuses.push('moving');
      break;
    case 'Error':
      statuses.push('error');
      statuses.push('inactive');
      statuses.push('stopped');
      break;
    default:
      break;
  }

  if (message.length > 0) {
    statuses.push('warning');
  }

  return statuses;
};
