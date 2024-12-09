import type {TorrentStatus} from '@shared/constants/torrentStatusMap';
import type {AddTorrentByFileOptions} from '@shared/schema/api/torrents';
import type {TorrentProperties} from '@shared/types/Torrent';

import truncateTo from './numberUtils';

export const getTorrentETAFromProperties = (
  processingTorrentProperties: Record<string, unknown>,
): TorrentProperties['eta'] => {
  const {downRate, bytesDone, sizeBytes} = processingTorrentProperties;

  if (typeof downRate !== 'number' || typeof bytesDone !== 'number' || typeof sizeBytes !== 'number') {
    return -1;
  }

  if (downRate > 0) {
    return (sizeBytes - bytesDone) / downRate;
  }

  return -1;
};

export const getTorrentPercentCompleteFromProperties = (
  processingTorrentProperties: Record<string, unknown>,
): TorrentProperties['percentComplete'] => {
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

export const getTorrentStatusFromProperties = (
  processingTorrentProperties: Record<string, unknown>,
): TorrentProperties['status'] => {
  const {isHashing, isComplete, isOpen, upRate, downRate, state, message} = processingTorrentProperties;

  const torrentStatus: Array<TorrentStatus> = [];

  if (isHashing) {
    torrentStatus.push('checking');
  } else if (isComplete && isOpen && state) {
    torrentStatus.push('complete');
    torrentStatus.push('seeding');
  } else if (isComplete && isOpen && !state) {
    torrentStatus.push('stopped');
  } else if (isComplete && !isOpen) {
    torrentStatus.push('stopped');
    torrentStatus.push('complete');
  } else if (!isComplete && isOpen && state) {
    torrentStatus.push('downloading');
  } else if (!isComplete && isOpen && !state) {
    torrentStatus.push('stopped');
  } else if (!isComplete && !isOpen) {
    torrentStatus.push('stopped');
  }

  if (typeof message === 'string' && message.length) {
    torrentStatus.push('error');
  }

  if (upRate !== 0 || downRate !== 0) {
    torrentStatus.push('active');
  } else {
    torrentStatus.push('inactive');
  }

  return torrentStatus;
};

export const encodeTags = (tags: TorrentProperties['tags']): string => {
  return tags
    .reduce((accumulator: Array<string>, currentTag) => {
      const tag = encodeURIComponent(currentTag.trim());

      if (tag !== '' && accumulator.indexOf(tag) === -1) {
        accumulator.push(tag);
      }

      return accumulator;
    }, [])
    .join(',');
};

export const getAddTorrentPropertiesCalls = ({
  destination,
  isBasePath,
  isSequential,
  isInitialSeeding,
  tags,
}: Required<
  Pick<AddTorrentByFileOptions, 'destination' | 'isBasePath' | 'isSequential' | 'isInitialSeeding' | 'tags'>
>) => {
  const result: Array<string> = [
    'd.tied_to_file.set=""',
    `d.custom.set=addtime,${Math.round(Date.now() / 1000)}`,
    `${isBasePath ? 'd.directory_base.set' : 'd.directory.set'}="${destination}"`,
  ];

  if (tags.length > 0) {
    result.push(`d.custom1.set="${encodeTags(tags)}"`);
  }

  if (isSequential) {
    result.push(`d.down.sequential.set=1`);
  }

  if (isInitialSeeding) {
    result.push(`d.connection_seed.set=initial_seed`);
  }

  return result;
};
