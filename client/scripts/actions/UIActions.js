import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import TorrentStore from '../stores/TorrentStore';

let UIActions = {
  displayContextMenu: (data) => {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_DISPLAY_CONTEXT_MENU,
      data
    });
  },

  displayDropdownMenu: (data) => {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_DISPLAY_DROPDOWN_MENU,
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
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_DISPLAY_MODAL,
      data: null
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

  setTorrentTagFilter: (data) => {
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_SET_TORRENT_TAG_FILTER,
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
    AppDispatcher.dispatchUIAction({
      type: ActionTypes.UI_SET_TORRENT_SORT,
      data
    });
  }
};

export default UIActions;
