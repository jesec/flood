import React from 'react';

import type {TorrentProperties} from '@shared/types/Torrent';

interface SelectTorrentOptions {
  event: React.MouseEvent;
  hash: string;
  selectedTorrents: Array<string>;
  torrentList: Array<TorrentProperties>;
}

function selectTorrents(options: SelectTorrentOptions): string[] {
  if (options.event.shiftKey) {
    if (options.selectedTorrents.length) {
      const lastHash = options.selectedTorrents[options.selectedTorrents.length - 1];
      let currentHashIndex = -1;
      let lastHashIndex = -1;

      // TODO: wtf? Let's just use findIndex or indexOf...
      // get the index of the last selected torrent.
      if (
        !options.torrentList.some((torrent, index) => {
          if (torrent.hash === lastHash) {
            lastHashIndex = index;
            return true;
          }

          return false;
        })
      ) {
        return options.selectedTorrents;
      }

      // TODO: wtf? Let's just use findIndex or indexOf...
      // get the index of the newly selected torrent.
      if (
        !options.torrentList.some((torrent, index) => {
          if (torrent.hash === options.hash) {
            currentHashIndex = index;
            return true;
          }

          return false;
        })
      ) {
        return options.selectedTorrents;
      }

      // from the previously selected index to the currently selected index,
      // add all torrent hashes to the selected array.
      // if the newly selcted hash is larger than the previous, start from
      // the newly selected hash and work backwards. otherwise go forwards.
      let increment = 1;

      if (currentHashIndex > lastHashIndex) {
        increment = -1;
      }

      while (currentHashIndex !== lastHashIndex) {
        const foundHash = options.torrentList[currentHashIndex].hash;
        // if the torrent isn't already selected, add the hash to the array.
        if (options.selectedTorrents.indexOf(foundHash) === -1) {
          options.selectedTorrents.push(foundHash);
        }
        currentHashIndex += increment;
      }
    } else {
      return [options.hash];
    }
  } else if (options.event.metaKey || options.event.ctrlKey) {
    const hashPosition = options.selectedTorrents.indexOf(options.hash);
    if (hashPosition === -1) {
      // if the hash is not in the array, add it.
      options.selectedTorrents.push(options.hash);
    } else {
      // if the hash is in the array, remove it.
      options.selectedTorrents.splice(hashPosition, 1);
    }
  } else {
    // clicked torrent is only item in list.
    return [options.hash];
  }
  return options.selectedTorrents;
}

export default selectTorrents;
