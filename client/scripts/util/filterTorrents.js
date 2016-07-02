import propsMaps from '../../../shared/constants/propsMap';

export function filterTorrents(torrentList, opts) {
  let statusMap = propsMaps.clientStatus;
  let {type, filter} = opts;

  if (filter !== 'all') {
    if (type === 'status') {
      let statusFilter = statusMap[filter];
      return torrentList.filter((torrent) => {
        return torrent.status.indexOf(statusFilter) > -1;
      });
    } else if (type === 'tracker') {
      return torrentList.filter((torrent) => {
        return torrent.trackers.indexOf(filter) > -1;
      });
    } else if (type === 'tag') {
      return torrentList.filter((torrent) => {
        if (filter === 'unlabeled') {
          return torrent.tags.length === 1 && torrent.tags[0] === '';
        }

        return torrent.tags.indexOf(filter) > -1;
      });
    }
  }

  return torrentList;
}
