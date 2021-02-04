import {getDomain} from 'tldts';

import type {TorrentProperties} from '../../shared/types/Torrent';

export const hasTorrentFinished = (
  prevData: Partial<TorrentProperties> = {},
  nextData: Partial<TorrentProperties> = {},
): boolean => {
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

export const getDomainsFromURLs = (urls: Array<string>): Array<string> => {
  return [
    ...urls.reduce((memo: Set<string>, url: string) => {
      const domain = getDomain(url);

      if (domain != null) {
        memo.add(domain);
      }

      return memo;
    }, new Set()),
  ];
};
