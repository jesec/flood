var AppDispatcher = require('../dispatcher/AppDispatcher');
var TorrentConstants = require('../constants/TorrentConstants');
var UIConstants = require('../constants/UIConstants');

var UIActions = {
  dismissModals: function() {
    AppDispatcher.dispatch({
      actionType: UIConstants.MODALS_DISMISS
    });
  },

  filterTorrentList: function(status) {
    AppDispatcher.dispatch({
      actionType: UIConstants.FILTER_STATUS_CHANGE,
      status: status
    });
  },

  scrollTorrentList: function(torrentCount) {
    AppDispatcher.dispatch({
      actionType: UIConstants.TORRENT_LIST_SCROLL,
      torrentCount: torrentCount
    });
  },

  searchTorrents: function(query) {
    AppDispatcher.dispatch({
      actionType: UIConstants.FILTER_SEARCH_CHANGE,
      query: query
    });
  },

  setViewportHeight: function(height) {
    AppDispatcher.dispatch({
      actionType: UIConstants.TORRENT_LIST_VIEWPORT_RESIZE,
      viewportHeight: height
    });
  },

  sortTorrents: function(property, direction) {
    AppDispatcher.dispatch({
      actionType: UIConstants.FILTER_SORT_CHANGE,
      property: property,
      direction: direction
    });
  },

  toggleAddTorrentModal: function() {
    AppDispatcher.dispatch({
      actionType: UIConstants.TORRENT_ADD_MODAL_TOGGLE
    });
  }
}

module.exports = UIActions;
