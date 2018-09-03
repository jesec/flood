import torrentStatusMap from 'universally-shared-code/constants/torrentStatusMap';

export function filterTorrents(torrentList, opts) {
  let {type, filter} = opts;

  if (filter !== 'all') {
    if (type === 'status') {
      let statusFilter = torrentStatusMap[filter];
      return torrentList.filter(torrent => {
        return torrent.status.includes(statusFilter);
      });
    } else if (type === 'tracker') {
      return torrentList.filter(torrent => {
        return torrent.trackerURIs.includes(filter);
      });
    } else if (type === 'tag') {
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
