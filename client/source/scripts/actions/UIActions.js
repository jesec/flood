export function displayModal(payload) {
  return {
    type: 'UI_DISPLAY_MODAL',
    payload
  };
}

export function dismissModal(payload) {
  return {
    type: 'UI_DISPLAY_MODAL',
    payload: {
      modal: null
    }
  };
}

export function handleTorrentClick(payload) {
  return {
    type: 'CLICK_TORRENT',
    payload
  };
}

export function setTorrentsFilter(payload) {
  return {
    type: 'UI_FILTER_TORRENTS',
    payload
  };
}

export function setTorrentsSearch(payload) {
  return {
    type: 'UI_SEARCH_TORRENTS',
    payload
  };
}

export function setTorrentsSort(payload) {
  return {
    type: 'UI_SORT_TORRENTS',
    payload
  };
}
