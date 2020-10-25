import debounce from 'lodash/debounce';
import React from 'react';

import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

import TorrentFilterStore from '../stores/TorrentFilterStore';
import TorrentStore from '../stores/TorrentStore';
import UIStore from '../stores/UIStore';

import type {ContextMenu, Modal} from '../stores/UIStore';

const UIActions = {
  displayContextMenu: (contextMenu: ContextMenu) => {
    UIStore.setActiveContextMenu(contextMenu);
  },

  displayDropdownMenu: (id: string) => {
    UIStore.setActiveDropdownMenu(id);
  },

  displayModal: (modal: Modal) => {
    UIStore.setActiveModal(modal);
  },

  dismissContextMenu: (id: string) => {
    UIStore.dismissContextMenu(id);
  },

  dismissModal: () => {
    UIStore.dismissModal();
  },

  handleTorrentClick: (data: {event: React.MouseEvent | React.TouchEvent; hash: string}) => {
    TorrentStore.setSelectedTorrents(data);
  },

  setTorrentStatusFilter: (status: TorrentStatus) => {
    TorrentFilterStore.setStatusFilter(status);
  },

  setTorrentTagFilter: (tag: string) => {
    TorrentFilterStore.setTagFilter(tag);
  },

  setTorrentTrackerFilter: (tracker: string) => {
    TorrentFilterStore.setTrackerFilter(tracker);
  },

  setTorrentsSearchFilter: debounce(
    (search: string) => {
      TorrentFilterStore.setSearchFilter(search);
    },
    250,
    {trailing: true},
  ),
} as const;

export default UIActions;
