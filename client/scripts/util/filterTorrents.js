import propsMaps from '../../../shared/constants/propsMap';

export function filterTorrents(torrentList, opts) {
  let statusMap = propsMaps.clientStatus;
  let {type, filter} = opts;

  if (filter !== 'all') {
    if (type === 'status') {
      let statusFilter = statusMap[filter];
      return torrentList.filter((torrent) => {
        if (torrent.status.indexOf(statusFilter) > -1) {
          return torrent;
        }
      });
    } else if (type === 'tracker') {
      return torrentList.filter((torrent) => {
        if (torrent.trackers.indexOf(filter) > -1) {
          return torrent;
        }
      });
    }
  }

  return torrentList;
}
