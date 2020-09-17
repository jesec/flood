import type {TorrentProperties} from '../stores/TorrentStore';

function searchTorrents(torrents: Array<TorrentProperties>, searchString: string): Array<TorrentProperties> {
  if (searchString !== '') {
    const queries: Array<RegExp> = [];
    const searchTerms = searchString.replace(/,/g, ' ').split(' ');

    for (let i = 0, len = searchTerms.length; i < len; i += 1) {
      queries.push(new RegExp(searchTerms[i], 'gi'));
    }

    return torrents.filter((torrent) => {
      for (let i = 0, len = queries.length; i < len; i += 1) {
        if (!torrent.name.match(queries[i])) {
          return false;
        }
      }
      return true;
    });
  }

  return torrents;
}

export default searchTorrents;
