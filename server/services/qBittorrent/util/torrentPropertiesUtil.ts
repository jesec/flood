import type {TorrentProperties} from '../../../../shared/types/Torrent';
import {TorrentPeer} from '../../../../shared/types/TorrentPeer';
import type {TorrentTracker} from '../../../../shared/types/TorrentTracker';
import {TorrentTrackerType} from '../../../../shared/types/TorrentTracker';
import type {QBittorrentTorrentState} from '../types/QBittorrentTorrentsMethods';

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

/**
 * qBittorrent resolves `isForced()` before it tests the payload rate
 * (`TorrentImpl::updateState`), so a force-started torrent is reported as
 * `forcedUP`/`forcedDL` whether or not it is transferring - the rate-bearing
 * `uploading`/`stalledUP` and `downloading`/`stalledDL` states are unreachable
 * for it. Those two states therefore cannot imply activity on their own, and
 * `isTransferring` is used instead, matching how the rTorrent backend derives
 * `active`/`inactive` from the observed rates.
 */
export const getTorrentStatusFromState = (
  state: QBittorrentTorrentState,
  trackerMessage = '',
  isTransferring = false,
): TorrentProperties['status'] => {
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
      break;
    case 'pausedUP':
    case 'stoppedUP':
      statuses.push('complete');
      statuses.push('inactive');
      statuses.push('stopped');
      break;
    case 'queuedUP':
    case 'stalledUP':
      statuses.push('complete');
      statuses.push('inactive');
      statuses.push('seeding');
      break;
    case 'forcedUP':
      statuses.push('complete');
      statuses.push(isTransferring ? 'active' : 'inactive');
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
    case 'forcedMetaDL':
    case 'downloading':
      statuses.push('active');
      statuses.push('downloading');
      break;
    case 'forcedDL':
      statuses.push(isTransferring ? 'active' : 'inactive');
      statuses.push('downloading');
      break;
    case 'pausedDL':
    case 'stoppedDL':
      statuses.push('inactive');
      statuses.push('stopped');
      break;
    case 'queuedDL':
    case 'stalledDL':
      statuses.push('inactive');
      statuses.push('downloading');
      break;
    case 'checkingDL':
      statuses.push('active');
      statuses.push('checking');
      break;
    case 'moving':
      statuses.push('moving');
      break;
    case 'checkingResumeData':
    case 'unknown':
      statuses.push('checking');
      break;
    default:
      break;
  }

  if (trackerMessage.length > 0) {
    statuses.push('warning');
  }

  return statuses;
};
