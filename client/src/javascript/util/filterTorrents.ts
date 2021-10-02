import type {TorrentProperties} from '@shared/types/Torrent';
import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

interface StatusFilter {
  type: 'status';
  filter: TorrentStatus;
  negated?: boolean;
}

interface TrackerFilter {
  type: 'tracker';
  filter: string;
  negated?: boolean;
}

interface TagFilter {
  type: 'tag';
  filter: string;
  negated?: boolean;
}

function filterTorrents(
  torrentList: TorrentProperties[],
  opts: StatusFilter | TrackerFilter | TagFilter,
): TorrentProperties[] {
  const {type, filter, negated} = opts;

  if (filter !== '') {
    if (type === 'status') {
      return torrentList.filter((torrent) => {
        const included = torrent.status.includes(filter as TorrentStatus);
        return included && !negated || !included && negated;
      });
    }
    if (type === 'tracker') {
      return torrentList.filter((torrent) => {
        const included = torrent.trackerURIs.includes(filter);
        return included && !negated || !included && negated;
      });
    }
    if (type === 'tag') {
      return torrentList.filter((torrent) => {
        if (filter === 'untagged') {
          return torrent.tags.length === 0;
        }

        const included = torrent.tags.includes(filter);
        return included && !negated || !included && negated;
      });
    }
  }

  return torrentList;
}

export default filterTorrents;
