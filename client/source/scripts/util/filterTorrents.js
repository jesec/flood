export function filterTorrents(torrents, filterBy) {
  if (filterBy !== 'all') {
    torrents = torrentList.filter(torrent => {
      if (torrent.status.indexOf('is-' + filterBy) > -1) {
        return torrent;
      }
    });
  }
  return torrents;
}
