import {TorrentPeer} from '../../../../shared/types/TorrentPeer';
import {TorrentTrackerType} from '../../../../shared/types/TorrentTracker';

import type {QBittorrentTorrentState} from '../types/QBittorrentTorrentsMethods';
import type {TorrentProperties} from '../../../../shared/types/Torrent';
import type {TorrentTracker} from '../../../../shared/types/TorrentTracker';

export const getTorrentPeerPropertiesFromFlags = (flags: string): Pick<TorrentPeer, 'isEncrypted' | 'isIncoming'> => {
  const flagsArray = flags.split(' ');

  return {
    isEncrypted: flagsArray.includes('E'),
    isIncoming: flagsArray.includes('I'),
  };
};

export const getTorrentTrackerTypeFromURL = (url: string): TorrentTracker['type'] => {
  if (url.startsWith('http')) {
    return TorrentTrackerType.HTTP;
  }

  if (url.startsWith('udp')) {
    return TorrentTrackerType.UDP;
  }

  return TorrentTrackerType.DHT;
};

export const getTorrentStatusFromState = (state: QBittorrentTorrentState): TorrentProperties['status'] => {
  const statuses: TorrentProperties['status'] = [];

  switch (state) {
    case 'error':
    case 'missingFiles':
      statuses.push('error');
      statuses.push('inactive');
      statuses.push('stopped');
      break;
    case 'uploading':
      statuses.push('complete');
      statuses.push('active');
      statuses.push('seeding');
      statuses.push('activelyUploading');
      break;
    case 'pausedUP':
      statuses.push('complete');
      statuses.push('inactive');
      statuses.push('stopped');
      break;
    case 'queuedUP':
    case 'stalledUP':
    case 'forcedUP':
      statuses.push('complete');
      statuses.push('inactive');
      statuses.push('seeding');
      break;
    case 'checkingUP':
      statuses.push('complete');
      statuses.push('active');
      statuses.push('checking');
      break;
    case 'allocating':
      statuses.push('downloading');
      break;
    case 'metaDL':
    case 'downloading':
      statuses.push('active');
      statuses.push('downloading');
      statuses.push('activelyDownloading');
      break;
    case 'pausedDL':
      statuses.push('inactive');
      statuses.push('stopped');
      break;
    case 'queuedDL':
    case 'stalledDL':
    case 'forceDL':
      statuses.push('inactive');
      statuses.push('downloading');
      break;
    case 'checkingDL':
      statuses.push('active');
      statuses.push('checking');
      break;
    case 'moving':
    case 'checkingResumeData':
    case 'unknown':
      statuses.push('checking');
      break;
    default:
      break;
  }

  return statuses;
};
