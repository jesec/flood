export function handleTorrentClick(payload) {
  return {
    type: 'CLICK_TORRENT',
    payload
  };
}

export function setTorrentsSort(payload) {
  return {
    type: 'UI_SORT_TORRENTS',
    payload
  };
}
