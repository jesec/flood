import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';

const UIActions = {
  displayModal: function(data) {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_DISPLAY_MODAL,
      data
    });
  },

  dismissModal: function(data) {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_DISPLAY_MODAL,
      data: null
    });
  },

  handleDetailsClick: function(data) {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_CLICK_TORRENT_DETAILS,
      data
    });
  },

  handleTorrentClick: function(data) {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_CLICK_TORRENT,
      data
    });
  },

  setTorrentStatusFilter: function(data) {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_SET_TORRENT_STATUS_FILTER,
      data
    });
  },

  setTorrentsSearchFilter: function(data) {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_SET_TORRENT_SEARCH_FILTER,
      data
    });
  },

  setTorrentsSort: function(data) {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_SET_TORRENT_SORT,
      data
    });
  }
};

export default UIActions;
