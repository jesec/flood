import type {TorrentProperties} from '../stores/TorrentStore';

export function searchTorrents(torrents: Array<TorrentProperties>, searchString: string): Array<TorrentProperties> {
  if (searchString !== '') {
    const queries: Array<RegExp> = [];
    const searchTerms = searchString.replace(/,/g, ' ').split(' ');

    for (let i = 0, len = searchTerms.length; i < len; i++) {
      queries.push(new RegExp(searchTerms[i], 'gi'));
    }

    torrents = torrents.filter((torrent) => {
      for (let i = 0, len = queries.length; i < len; i++) {
        if (!torrent.name.match(queries[i])) {
          return false;
        }
      }
      return true;
    });
  }

  return torrents;
}
