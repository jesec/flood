import keyMirror from 'keymirror';

const UIConstants = keyMirror({
  FILTER_SORT_CHANGE: 'filter--sort--change',
  FILTER_SEARCH_CHANGE: 'filter--search--change',
  FILTER_STATUS_CHANGE: 'filter--status--change',
  TORRENT_LIST_SCROLL: 'torrent-list--scroll',
  TORRENT_LIST_VIEWPORT_RESIZE: 'torrent-list--resize',
  TORRENT_LIST_PADDING_CHANGE: 'torrent-list--padding--change',
  TORRENT_ADD_MODAL_TOGGLE: 'add-modal--toggle',
  TORRENT_ADD_MODAL_TOGGLE_CHANGE: 'add-modal--change',
  MODALS_DISMISS: 'modal--dismiss'
});

export default UIConstants;
