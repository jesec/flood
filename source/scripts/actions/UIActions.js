import AppDispatcher from '../dispatcher/AppDispatcher';
import TorrentConstants from '../constants/TorrentConstants';
import UIConstants from '../constants/UIConstants';

const UIActions = {

  dismissModals() {
    AppDispatcher.dispatch({
      actionType: UIConstants.MODALS_DISMISS
    });
  },

  filterTorrentList(status) {
    AppDispatcher.dispatch({
      actionType: UIConstants.FILTER_STATUS_CHANGE,
      status: status
    });
  },

  scrollTorrentList(torrentListScrollPosition, torrentCount) {
    AppDispatcher.dispatch({
      actionType: UIConstants.TORRENT_LIST_SCROLL,
      torrentListScrollPosition: torrentListScrollPosition,
      torrentCount: torrentCount
    });
  },

  searchTorrents(query) {
    AppDispatcher.dispatch({
      actionType: UIConstants.FILTER_SEARCH_CHANGE,
      query: query
    });
  },

  setViewportHeight(height) {
    AppDispatcher.dispatch({
      actionType: UIConstants.TORRENT_LIST_VIEWPORT_RESIZE,
      viewportHeight: height
    });
  },

  sortTorrents(property, direction) {
    AppDispatcher.dispatch({
      actionType: UIConstants.FILTER_SORT_CHANGE,
      property: property,
      direction: direction
    });
  },

  toggleAddTorrentModal() {
    AppDispatcher.dispatch({
      actionType: UIConstants.TORRENT_ADD_MODAL_TOGGLE
    });
  }

};

export default UIActions;
