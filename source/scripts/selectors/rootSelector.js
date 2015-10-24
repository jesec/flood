import { createSelector } from 'reselect';

import clientSelector from './clientSelector';
import { sortTorrents } from '../util/sortTorrents';
import torrentSelector from './torrentSelector';
import uiSelector from './uiSelector';

const rootSelector = createSelector(
  clientSelector,
  torrentSelector,
  uiSelector,
  (client, torrents, ui) => {
    return {
      client,
      torrents: sortTorrents(torrents, ui.torrentList.sortBy),
      ui
    };
  }
);

export default rootSelector;
