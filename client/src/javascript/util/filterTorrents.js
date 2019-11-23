import torrentStatusMap from '@shared/constants/torrentStatusMap';

export function filterTorrents(torrentList, opts) {
  const {type, filter} = opts;

  if (filter !== 'all') {
    if (type === 'status') {
      const statusFilter = torrentStatusMap[filter];
      return torrentList.filter(torrent => torrent.status.includes(statusFilter));
    }
    if (type === 'tracker') {
      return torrentList.filter(torrent => torrent.trackerURIs.includes(filter));
    }
    if (type === 'tag') {
      return torrentList.filter(torrent => {
        if (filter === 'untagged') {
          return torrent.tags.length === 0;
        }

        return torrent.tags.includes(filter);
      });
    }
  }

  return torrentList;
}
