import {createSelector} from 'reselect';

import clientSelector from './clientSelector';
import torrentSelector from './torrentSelector';
import uiSelector from './uiSelector';

const rootSelector = createSelector(
  clientSelector,
  torrentSelector,
  uiSelector,
  (client, torrents, ui) => {
    return {
      client,
      torrents,
      ui
    };
  }
);

export default rootSelector;
