import { createSelector } from 'reselect';
import { sortTorrents } from '../util/sortTorrents';

const torrentListSort = (state) => {
  return state.ui.torrentList.sortBy;
};

const torrentList = (state) => {
  return state.torrents;
};

const torrentSelector = createSelector(
  torrentListSort,
  torrentList,
  (torrentListSort, torrentList) => {
    return sortTorrents(torrentList, torrentListSort);
  }
);

export default torrentSelector;
