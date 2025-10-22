import type {TorrentProperties} from '@shared/types/Torrent';
import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

interface LocationFilter {
  type: 'location';
  filter: string[];
}

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
  opts: LocationFilter | StatusFilter | TrackerFilter | TagFilter,
): TorrentProperties[] {
  if (opts.filter.length) {
    if (opts.type === 'location') {
      return torrentList.filter((torrent) => opts.filter.some((directory) => torrent.directory.startsWith(directory)));
    }

    if (opts.type === 'status') {
      return torrentList.filter((torrent) => torrent.status.some((status) => opts.filter.includes(status)));
    }

    if (opts.type === 'tracker') {
      return torrentList.filter((torrent) =>
        torrent.trackerURIs.some((uri) => {
          // Extract domain from tracker URI to match taxonomy computation
          let domain = uri;
          try {
            if (uri.includes('://')) {
              const url = new URL(uri);
              domain = url.hostname;
            } else {
              domain = uri.split('/')[0].split(':')[0];
            }
          } catch {
            // Use as-is if parsing fails
          }
          return opts.filter.includes(domain);
        }),
      );
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
