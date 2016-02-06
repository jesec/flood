import propsMaps from '../../../../shared/constants/propsMap';

export function filterTorrents(torrentList, filterBy) {
  let statusMap = propsMaps.clientStatus;

  if (filterBy !== 'all') {
    torrentList = torrentList.filter((torrent) => {
      if (torrent.status.indexOf(statusMap[filterBy]) > -1) {
        return torrent;
      }
    });
  }

  return torrentList;
}
