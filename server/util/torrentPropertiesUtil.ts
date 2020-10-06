import formatUtil from '../../shared/util/formatUtil';
import truncateTo from './numberUtils';

import type {TorrentProperties} from '../../shared/types/Torrent';
import type {TorrentStatus} from '../../shared/constants/torrentStatusMap';

export const getTorrentETAFromProperties = (processingTorrentProperties: Record<string, unknown>) => {
  const {downRate, bytesDone, sizeBytes} = processingTorrentProperties;

  if (typeof downRate !== 'number' || typeof bytesDone !== 'number' || typeof sizeBytes !== 'number') {
    return Infinity;
  }

  if (downRate > 0) {
    return formatUtil.secondsToDuration((sizeBytes - bytesDone) / downRate);
  }

  return Infinity;
};

export const getTorrentPercentCompleteFromProperties = (processingTorrentProperties: Record<string, unknown>) => {
  const {bytesDone, sizeBytes} = processingTorrentProperties;

  if (typeof bytesDone !== 'number' || typeof sizeBytes !== 'number') {
    return 0;
  }

  const percentComplete = (bytesDone / sizeBytes) * 100;

  if (percentComplete > 0 && percentComplete < 10) {
    return Number(truncateTo(percentComplete, 2));
  }
  if (percentComplete > 10 && percentComplete < 100) {
    return Number(truncateTo(percentComplete, 1));
  }

  return percentComplete;
};

export const getTorrentStatusFromProperties = (processingTorrentProperties: Record<string, unknown>) => {
  const {isHashing, isComplete, isOpen, upRate, downRate, state, message} = processingTorrentProperties;

  const torrentStatus: Array<TorrentStatus> = [];

  if (isHashing !== '0') {
    torrentStatus.push('checking');
  } else if (isComplete && isOpen && state === '1') {
    torrentStatus.push('complete');
    torrentStatus.push('seeding');
  } else if (isComplete && isOpen && state === '0') {
    torrentStatus.push('stopped');
  } else if (isComplete && !isOpen) {
    torrentStatus.push('stopped');
    torrentStatus.push('complete');
  } else if (!isComplete && isOpen && state === '1') {
    torrentStatus.push('downloading');
  } else if (!isComplete && isOpen && state === '0') {
    torrentStatus.push('stopped');
  } else if (!isComplete && !isOpen) {
    torrentStatus.push('stopped');
  }

  if (typeof message === 'string' && message.length) {
    torrentStatus.push('error');
  }

  if (upRate !== 0) {
    torrentStatus.push('activelyUploading');
  }

  if (downRate !== 0) {
    torrentStatus.push('activelyDownloading');
  }

  if (upRate !== 0 || downRate !== 0) {
    torrentStatus.push('active');
  } else {
    torrentStatus.push('inactive');
  }

  return torrentStatus;
};

export const hasTorrentFinished = (
  prevData: Partial<TorrentProperties> = {},
  nextData: Partial<TorrentProperties> = {},
) => {
  if (prevData.status != null && prevData.status.includes('checking')) {
    return false;
  }

  if (prevData.percentComplete == null || nextData.percentComplete == null) {
    return false;
  }

  if (prevData.percentComplete < 100 && nextData.percentComplete === 100) {
    return true;
  }

  return false;
};
