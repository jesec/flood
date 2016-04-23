import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import TorrentStore from '../stores/TorrentStore';

const UIActions = {
  displayContextMenu: (data) => {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_DISPLAY_CONTEXT_MENU,
      data
    });
  },

  displayModal: (data) => {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_DISPLAY_MODAL,
      data
    });
  },

  dismissContextMenu: () => {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_DISPLAY_CONTEXT_MENU,
      data: null
    });
  },

  dismissModal: () => {
    try {
      // if (AppDispatcher.isDispatching()) {
      //   AppDispatcher.waitFor([TorrentStore.dispatcherID]);
      // }
      AppDispatcher.dispatchUIAction({
        type: ActionTypes.UI_DISPLAY_MODAL,
        data: null
      });
    } catch (err) {
      console.error(err);
    }
  },

  fetchSortProps: () => {
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

  handleDetailsClick: (data) => {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_CLICK_TORRENT_DETAILS,
      data
    });
  },

  handleTorrentClick: (data) => {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_CLICK_TORRENT,
      data
    });
  },

  setTorrentStatusFilter: (data) => {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_SET_TORRENT_STATUS_FILTER,
      data
    });
  },

  setTorrentTrackerFilter: (data) => {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_SET_TORRENT_TRACKER_FILTER,
      data
    });
  },

  setTorrentsSearchFilter: (data) => {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_SET_TORRENT_SEARCH_FILTER,
      data
    });
  },

  setTorrentsSort: (data) => {
    axios
      .post('/ui/sort-props', data)
      .catch(() => {
        console.log(error);
      });

    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_SET_TORRENT_SORT,
      data
    });
  }
};

export default UIActions;
