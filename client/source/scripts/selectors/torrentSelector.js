import { createSelector } from 'reselect';
import { filterTorrents } from '../util/filterTorrents';
import { searchTorrents } from '../util/searchTorrents';
import { sortTorrents } from '../util/sortTorrents';

const torrentListSearchString = state => state.ui.torrentList.searchString;

const torrentListSortBy = state => state.ui.torrentList.sortBy;

const torrentListFilterBy = state => state.ui.torrentList.filterBy;

const torrentList = state => state.torrents;

const filteredTorrents = createSelector(
  torrentListFilterBy,
  torrentList,
  (torrentListFilterBy, torrentList) => {
    return filterTorrents(torrentList, torrentListFilterBy);
  }
);

const searchedTorrents = createSelector(
  torrentListSearchString,
  filteredTorrents,
  (torrentListSearchString, filteredTorrents) => {
    return searchTorrents(filteredTorrents, torrentListSearchString);
  }
);

const torrentSelector = createSelector(
  torrentListSortBy,
  searchedTorrents,
  (torrentListSortBy, searchedTorrents) => {
    return sortTorrents(searchedTorrents, torrentListSortBy);
  }
);

export default torrentSelector;
