import {sort} from 'fast-sort';

import type {FloodSettings} from '@shared/types/FloodSettings';
import type {TorrentProperties} from '@shared/types/Torrent';

type SortRule = {
  [direction in FloodSettings['sortTorrents']['direction']]:
    | keyof TorrentProperties
    | ((p: TorrentProperties) => unknown);
};

function sortTorrents(
  torrents: TorrentProperties[],
  sortBy: Readonly<FloodSettings['sortTorrents']>,
): TorrentProperties[] {
  const {property} = sortBy;
  const sortRules: Array<SortRule> = [];

  switch (property) {
    case 'peers':
    case 'seeds':
      sortRules.push(
        {[sortBy.direction]: `${property}Connected`} as SortRule,
        {[sortBy.direction]: `${property}Total`} as SortRule,
      );
      break;
    case 'eta':
      sortRules.push({
        [sortBy.direction]: (p: TorrentProperties) => {
          if (p.eta === -1) {
            return Infinity;
          }
          return p.eta;
        },
      } as SortRule);
      break;
    case 'tags':
      sortRules.push({
        [sortBy.direction]: (p: TorrentProperties) => p[property].join(',').toLowerCase(),
      } as SortRule);
      break;
    case 'directory':
    case 'hash':
    case 'message':
    case 'name':
      // Those fields are strings. We want case-insensitive sorting.
      sortRules.push({
        [sortBy.direction]: (p: TorrentProperties) => p[property].toLowerCase(),
      } as SortRule);
      break;
    default:
      sortRules.push({[sortBy.direction]: property} as SortRule);
      break;
  }

  return sort(torrents).by(sortRules);
}

export default sortTorrents;
