import type {TorrentProperties} from '@shared/types/Torrent';
import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

interface StatusFilter {
  type: 'status';
  filter: TorrentStatus;
}

interface TrackerFilter {
  type: 'tracker';
  filter: string;
}

interface TagFilter {
  type: 'tag';
  filter: string;
}

function filterTorrents(
  torrentList: TorrentProperties[],
  opts: StatusFilter | TrackerFilter | TagFilter,
): TorrentProperties[] {
  const {type, filter} = opts;

  if (filter !== '') {
    if (type === 'status') {
      return torrentList.filter((torrent) => torrent.status.includes(filter as TorrentStatus));
    }
    if (type === 'tracker') {
      return torrentList.filter((torrent) => torrent.trackerURIs.includes(filter));
    }
    if (type === 'tag') {
      return torrentList.filter((torrent) => {
        if (filter === 'untagged') {
          return torrent.tags.length === 0;
        }

        return torrent.tags.includes(filter);
      });
    }
  }

  return torrentList;
}

export default filterTorrents;
