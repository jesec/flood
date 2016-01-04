export function filterTorrents(torrentList, filterBy) {
  if (filterBy !== 'all') {
    torrentList = torrentList.filter(torrent => {
      if (torrent.status.indexOf('is-' + filterBy) > -1) {
        return torrent;
      }
    });
  }
  return torrentList;
}
