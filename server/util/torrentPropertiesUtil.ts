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
      const fqdn = url.split('/')[2]?.split(':')[0];

      if (fqdn?.length > 0) {
        const domainLastParts = fqdn.split('.').slice(-2);

        // ignore IP addresses. RFC 952: first char of a valid TLD must be an alpha char
        if (!'0123456789'.includes(domainLastParts[domainLastParts.length - 1]?.[0])) {
          memo.add(domainLastParts.join('.'));
        }
      }

      return memo;
    }, new Set()),
  ];
};
