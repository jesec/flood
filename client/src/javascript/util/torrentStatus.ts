import classnames from 'classnames';

import type {TorrentProperties} from '@shared/types/Torrent';

export interface TorrentStatusOptions {
  trackerWarningEnabled?: boolean;
}

export const torrentStatusClasses = (
  {status, downRate, upRate}: Pick<TorrentProperties, 'status' | 'downRate' | 'upRate'>,
  options: TorrentStatusOptions,
  ...classes: Array<string>
): string =>
  classnames(classes, {
    'torrent--has-error': status.includes('error'),
    'torrent--has-warning': (options.trackerWarningEnabled ?? true) && status.includes('warning'),
    'torrent--is-stopped': status.includes('stopped'),
    'torrent--is-downloading': status.includes('downloading'),
    'torrent--is-downloading--actively': downRate > 0,
    'torrent--is-uploading--actively': upRate > 0,
    'torrent--is-seeding': status.includes('seeding'),
    'torrent--is-completed': status.includes('complete'),
    'torrent--is-checking': status.includes('checking'),
    'torrent--is-moving': status.includes('moving'),
    'torrent--is-inactive': status.includes('inactive'),
  });

export const torrentStatusEffective = (
  status: TorrentProperties['status'],
  options?: TorrentStatusOptions,
): TorrentProperties['status'][number] => {
  const warningEnabled = options?.trackerWarningEnabled ?? true;
  let result: TorrentProperties['status'][number] = 'stopped';

  ['warning', 'error', 'moving', 'checking', 'stopped', 'downloading', 'seeding'].some((state) => {
    if (state === 'warning' && !warningEnabled) {
      return false;
    }
    if (status.includes(state as TorrentProperties['status'][number])) {
      result = state as TorrentProperties['status'][number];
      return true;
    }
    return false;
  });

  return result;
};
