import {createSelector} from 'reselect';
import {filterTorrents} from '../util/filterTorrents';
import {searchTorrents} from '../util/searchTorrents';
import {sortTorrents} from '../util/sortTorrents';

const torrentListSearchString = state => state.ui.torrentList.searchString;

const torrentListSortBy = state => state.ui.torrentList.sortBy;

const torrentListFilterBy = state => state.ui.torrentList.filterBy;

const selectedTorrents = state => state.torrents.selectedTorrents;

const torrentList = state => state.torrents.torrents;

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

const sortedTorrents = createSelector(
  searchedTorrents,
  torrentListSortBy,
  (searchedTorrents, torrentListSortBy) => {
    return sortTorrents(searchedTorrents, torrentListSortBy);
  }
);

const torrentSelector = createSelector(
  selectedTorrents,
  sortedTorrents,
  (selectedTorrents, sortedTorrents) => {
    return {
      selectedTorrents,
      torrents: sortedTorrents
    };
  }
);

export default torrentSelector;
