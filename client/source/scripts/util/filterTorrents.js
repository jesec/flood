export function filterTorrents(torrentList, torrentListFilterBy) {
  let filteredtorrentList = torrentList;

  if (torrentListFilterBy !== 'all') {
    filteredtorrentList = torrentList.filter(torrent => {
      if (torrent.status.indexOf('is-' + torrentListFilterBy) > -1) {
        return torrent;
      }
    });
  }

  return filteredtorrentList;
}
