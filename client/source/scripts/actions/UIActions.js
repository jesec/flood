import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import TorrentStore from '../stores/TorrentStore';

const UIActions = {
  displayContextMenu: function(data) {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_DISPLAY_CONTEXT_MENU,
      data
    });
  },

  displayModal: function(data) {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_DISPLAY_MODAL,
      data
    });
  },

  dismissContextMenu: function() {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_DISPLAY_CONTEXT_MENU,
      data: null
    });
  },

  dismissModal: function() {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_DISPLAY_MODAL,
      data: null
    });
  },

  fetchSortProps: function() {
    return axios.get('/ui/sort-props')
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.UI_SORT_PROPS_REQUEST_SUCCESS,
          data
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.UI_SORT_PROPS_REQUEST_ERROR,
          error
        });
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

  setTorrentTrackerFilter: function(data) {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_SET_TORRENT_TRACKER_FILTER,
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
    axios
      .post('/ui/sort-props', data)
      .catch(function (error) {
        console.log(error);
      });

    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_SET_TORRENT_SORT,
      data
    });
  }
};

export default UIActions;
