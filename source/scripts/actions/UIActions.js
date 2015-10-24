export function handleTorrentClick(options) {
  return {
    type: 'CLICK_TORRENT',
    payload: {
      hash: options.hash,
      event: options.event
    }
  };
}

export function setTorrentsSort(sortBy) {
  return {
    type: 'UI_SORT_TORRENTS',
    payload: {
      sortBy
    }
  };
}
