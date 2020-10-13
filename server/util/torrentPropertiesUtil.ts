import regEx from '../../shared/util/regEx';

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
  const domains: Array<string> = [];

  urls.forEach((url) => {
    const regexMatched = regEx.domainName.exec(url);

    if (regexMatched != null && regexMatched[1]) {
      let domain = regexMatched[1];

      const minSubsetLength = 3;
      const domainSubsets = domain.split('.');
      let desiredSubsets = 2;

      if (domainSubsets.length > desiredSubsets) {
        const lastDesiredSubset = domainSubsets[domainSubsets.length - desiredSubsets];
        if (lastDesiredSubset.length <= minSubsetLength) {
          desiredSubsets += 1;
        }
      }

      domain = domainSubsets.slice(desiredSubsets * -1).join('.');

      domains.push(domain);
    }
  });

  // Deduplicate
  return [...new Set(domains)];
};
