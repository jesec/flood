export function searchTorrents(torrents, searchString) {
  let searchedTorrents = torrents;

  if (searchString !== '') {
    let queries = [];
    let searchTerms = searchString.replace(/,/g, ' ').split(' ');

    for (let i = 0, len = searchTerms.length; i < len; i++) {
      queries.push(new RegExp(searchTerms[i], 'gi'));
    }

    searchedTorrents = searchedTorrents.filter(torrent => {
      for (let i = 0, len = queries.length; i < len; i++) {
        if (!torrent.name.match(queries[i])) {
          return false;
        }
      }
      return true;
    });
  }

  return searchedTorrents;
}
