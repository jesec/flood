import type {TorrentProperties} from '@shared/types/Torrent';
import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

interface StatusFilter {
  type: 'status';
  filter: TorrentStatus[];
}

interface TrackerFilter {
  type: 'tracker';
  filter: string[];
}

interface TagFilter {
  type: 'tag';
  filter: string[];
}

function filterTorrents(
  torrentList: TorrentProperties[],
  opts: StatusFilter | TrackerFilter | TagFilter,
): TorrentProperties[] {
  if (opts.filter.length) {
    if (opts.type === 'status') {
      return torrentList.filter((torrent) => torrent.status.some((status) => opts.filter.includes(status)));
    }

    if (opts.type === 'tracker') {
      return torrentList.filter((torrent) => torrent.trackerURIs.some((uri) => opts.filter.includes(uri)));
    }

    if (opts.type === 'tag') {
      const includeUntagged = opts.filter.includes('untagged');
      return torrentList.filter(
        (torrent) =>
          (includeUntagged && torrent.tags.length === 0) || torrent.tags.some((tag) => opts.filter.includes(tag)),
      );
    }
  }

  return torrentList;
}

export default filterTorrents;
