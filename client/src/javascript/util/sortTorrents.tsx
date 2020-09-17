// TODO: Split up this garbage.
import type {FloodSettings} from '../stores/SettingsStore';
import type {Duration, Torrents, TorrentProperties} from '../stores/TorrentStore';

const stringProps = ['basePath', 'comment', 'hash', 'message', 'name'];

function sortTorrents(torrentsHash: Torrents, sortBy: FloodSettings['sortTorrents']) {
  const torrents = Object.keys(torrentsHash).map((hash) => ({...torrentsHash[hash]}));

  if (torrents.length) {
    const {direction, property} = sortBy;

    torrents.sort((a, b) => {
      let valA = a[property as keyof TorrentProperties];
      let valB = b[property as keyof TorrentProperties];

      if (property === 'peers' || property === 'seeds') {
        valA = a[`${property}Connected` as keyof TorrentProperties];
        valB = b[`${property}Connected` as keyof TorrentProperties];

        if (valA === valB) {
          valA = a[`${property}Total` as keyof TorrentProperties];
          valB = b[`${property}Total` as keyof TorrentProperties];
        }
      } else if (property === 'eta') {
        // Keep Infinity and null values at bottom of array.
        if ((valA === 'Infinity' && valB !== 'Infinity') || (valA == null && valB != null)) {
          return 1;
        }
        if ((valA !== 'Infinity' && valB === 'Infinity') || (valA != null && valB == null)) {
          return -1;
        }
        if (valA == null && valB == null) {
          return 0;
        }

        // If it's not infinity, compare the cumulative seconds as regular numbers.
        if (valA !== 'Infinity') {
          valA = Number((valA as Duration).cumSeconds);
        }

        if (valB !== 'Infinity') {
          valB = Number((valB as Duration).cumSeconds);
        }
      } else if (property === 'tags') {
        // TODO: Find a better way to sort tags.
        valA = (valA as TorrentProperties['tags']).join(',').toLowerCase();
        valB = (valB as TorrentProperties['tags']).join(',').toLowerCase();
      } else if (stringProps.includes(property)) {
        valA = (valA as string).toLowerCase();
        valB = (valB as string).toLowerCase();
      } else {
        valA = Number(valA);
        valB = Number(valB);
      }

      // TODO: Use locale compare for sorting strings.
      if (direction === 'asc') {
        if (valA > valB) {
          return 1;
        }
        if (valA < valB) {
          return -1;
        }
      } else {
        if (valA > valB) {
          return -1;
        }
        if (valA < valB) {
          return 1;
        }
      }

      return 0;
    });

    return torrents;
  }
  return torrents;
}

export default sortTorrents;
