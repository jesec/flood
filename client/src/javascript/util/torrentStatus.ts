import classnames from 'classnames';

import type {TorrentProperties} from '@shared/types/Torrent';

export const torrentStatusClasses = (
  {status, downRate, upRate}: Pick<TorrentProperties, 'status' | 'downRate' | 'upRate'>,
  ...classes: Array<string>
): string =>
  classnames(classes, {
    'torrent--has-error': status.includes('error'),
    'torrent--is-stopped': status.includes('stopped'),
    'torrent--is-downloading': status.includes('downloading'),
    'torrent--is-downloading--actively': downRate > 0,
    'torrent--is-uploading--actively': upRate > 0,
    'torrent--is-seeding': status.includes('seeding'),
    'torrent--is-completed': status.includes('complete'),
    'torrent--is-checking': status.includes('checking'),
    'torrent--is-inactive': status.includes('inactive'),
  });

export const torrentStatusEffective = (status: TorrentProperties['status']): TorrentProperties['status'][number] => {
  let result: TorrentProperties['status'][number] = 'stopped';

  ['error', 'checking', 'stopped', 'downloading', 'seeding'].some((state) => {
    if (status.includes(state as TorrentProperties['status'][number])) {
      result = state as TorrentProperties['status'][number];
      return true;
    }
    return false;
  });

  return result;
};
