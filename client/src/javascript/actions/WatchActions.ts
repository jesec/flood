import axios from 'axios';

import ConfigStore from '@client/stores/ConfigStore';
import WatchStore from '@client/stores/WatchStore';

import type {AddWatchOptions, ModifyWatchOptions} from '@shared/types/api/watch-monitor';
import {WatchedDirectory} from '@shared/types/Watch';

const {baseURI} = ConfigStore;

const WatchActions = {
  addWatch: (options: AddWatchOptions) =>
    axios.put(`${baseURI}api/watch-monitor`, options).then(() => WatchActions.fetchWatchMonitors()),

  modifyWatch: (id: string, options: ModifyWatchOptions) =>
    axios.patch(`${baseURI}api/watch-monitor/${id}`, options).then(() => WatchActions.fetchWatchMonitors()),

  fetchWatchMonitors: () =>
    axios.get<Array<WatchedDirectory>>(`${baseURI}api/watch-monitor`).then(
      ({data}) => {
        WatchStore.handleWatchedDirectoryFetchSuccess(data);
      },
      () => {
        // do nothing.
      },
    ),

  removeWatchMonitors: (id: string) =>
    axios.delete(`${baseURI}api/watch-monitor/${id}`).then(
      () => WatchActions.fetchWatchMonitors(),
      () => {
        // do nothing.
      },
    ),
} as const;

export default WatchActions;
