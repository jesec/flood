import debounce from 'lodash/debounce';
import React from 'react';

import type {FloodSettings} from '@shared/types/FloodSettings';
import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

import AppDispatcher from '../dispatcher/AppDispatcher';

import type {ContextMenu, Modal} from '../stores/UIStore';

export interface UIClickTorrentAction {
  type: 'UI_CLICK_TORRENT';
  data: {event: React.MouseEvent | React.TouchEvent; hash: string};
}

export interface UIClickTorrentDetailsAction {
  type: 'UI_CLICK_TORRENT_DETAILS';
  data: {event: React.MouseEvent; hash: string};
}

export interface UIDismissContextMenuAction {
  type: 'UI_DISMISS_CONTEXT_MENU';
  data: ContextMenu['id'];
}

export interface UIDisplayContextMenuAction {
  type: 'UI_DISPLAY_CONTEXT_MENU';
  data: ContextMenu;
}

export interface UIDisplayDropdownMenuAction {
  type: 'UI_DISPLAY_DROPDOWN_MENU';
  data: string;
}

export interface UIDisplayModalAction {
  type: 'UI_DISPLAY_MODAL';
  data: Modal | null;
}

export interface UISetTorrentSortAction {
  type: 'UI_SET_TORRENT_SORT';
  data: FloodSettings['sortTorrents'];
}

export interface UISetTorrentSearchFilterAction {
  type: 'UI_SET_TORRENT_SEARCH_FILTER';
  data: string;
}

export interface UISetTorrentStatusFilterAction {
  type: 'UI_SET_TORRENT_STATUS_FILTER';
  data: TorrentStatus;
}

export interface UISetTorrentTagFilterAction {
  type: 'UI_SET_TORRENT_TAG_FILTER';
  data: string;
}

export interface UISetTorrentTrackerFilterAction {
  type: 'UI_SET_TORRENT_TRACKER_FILTER';
  data: string;
}

export type UIAction =
  | UIClickTorrentAction
  | UIClickTorrentDetailsAction
  | UIDismissContextMenuAction
  | UIDisplayContextMenuAction
  | UIDisplayDropdownMenuAction
  | UIDisplayModalAction
  | UISetTorrentSortAction
  | UISetTorrentSearchFilterAction
  | UISetTorrentStatusFilterAction
  | UISetTorrentTagFilterAction
  | UISetTorrentTrackerFilterAction;

const UIActions = {
  displayContextMenu: (data: UIDisplayContextMenuAction['data']) => {
    AppDispatcher.dispatchUIAction({
      type: 'UI_DISPLAY_CONTEXT_MENU',
      data,
    });
  },

  displayDropdownMenu: (data: UIDisplayDropdownMenuAction['data']) => {
    AppDispatcher.dispatchUIAction({
      type: 'UI_DISPLAY_DROPDOWN_MENU',
      data,
    });
  },

  displayModal: (data: Exclude<UIDisplayModalAction['data'], null>) => {
    AppDispatcher.dispatchUIAction({
      type: 'UI_DISPLAY_MODAL',
      data,
    });
  },

  dismissContextMenu: (contextMenuID: UIDismissContextMenuAction['data']) => {
    AppDispatcher.dispatchUIAction({
      type: 'UI_DISMISS_CONTEXT_MENU',
      data: contextMenuID,
    });
  },

  dismissModal: () => {
    AppDispatcher.dispatchUIAction({
      type: 'UI_DISPLAY_MODAL',
      data: null,
    });
  },

  handleDetailsClick: (data: UIClickTorrentDetailsAction['data']) => {
    AppDispatcher.dispatchUIAction({
      type: 'UI_CLICK_TORRENT_DETAILS',
      data,
    });
  },

  handleTorrentClick: (data: UIClickTorrentAction['data']) => {
    AppDispatcher.dispatchUIAction({
      type: 'UI_CLICK_TORRENT',
      data,
    });
  },

  setTorrentStatusFilter: (data: UISetTorrentStatusFilterAction['data']) => {
    AppDispatcher.dispatchUIAction({
      type: 'UI_SET_TORRENT_STATUS_FILTER',
      data,
    });
  },

  setTorrentTagFilter: (data: UISetTorrentTagFilterAction['data']) => {
    AppDispatcher.dispatchUIAction({
      type: 'UI_SET_TORRENT_TAG_FILTER',
      data,
    });
  },

  setTorrentTrackerFilter: (data: UISetTorrentTrackerFilterAction['data']) => {
    AppDispatcher.dispatchUIAction({
      type: 'UI_SET_TORRENT_TRACKER_FILTER',
      data,
    });
  },

  setTorrentsSearchFilter: debounce(
    (data: UISetTorrentSearchFilterAction['data']) => {
      AppDispatcher.dispatchUIAction({
        type: 'UI_SET_TORRENT_SEARCH_FILTER',
        data,
      });
    },
    250,
    {trailing: true},
  ),

  setTorrentsSort: (data: UISetTorrentSortAction['data']) => {
    AppDispatcher.dispatchUIAction({
      type: 'UI_SET_TORRENT_SORT',
      data,
    });
  },
};

export default UIActions;
