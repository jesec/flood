import { createSelector } from 'reselect';
import { sortTorrents } from '../util/sortTorrents';

const torrentListSortBy = (state) => {
  return state.ui.torrentList.sortBy;
};

const torrentList = (state) => {
  return state.torrents;
};

const torrentSelector = createSelector(
  torrentListSortBy,
  torrentList,
  (torrentListSortBy, torrentList) => {
    return sortTorrents(torrentList, torrentListSortBy);
  }
);

export default torrentSelector;
