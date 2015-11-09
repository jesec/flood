import { createSelector } from 'reselect';

const fetchingData = state => state.ui.fetchingData;

const modal = state => state.ui.modal;

const torrentListCount = state => state.ui.torrentList.count;

const torrentListSelected = state => state.torrents.selectedTorrents;

const torrentListSearchString = state => state.ui.torrentList.searchString;

const torrentListSortBy = state => state.ui.torrentList.sortBy;

const torrentListFilterBy = state => state.ui.torrentList.filterBy;

const torrentList = createSelector(
  torrentListCount,
  torrentListSearchString,
  torrentListSelected,
  torrentListSortBy,
  torrentListFilterBy,
  (count, searchString, selected, sortBy, filterBy) => {
    return {
      count,
      searchString,
      selected,
      sortBy,
      filterBy
    };
  }
);

const uiSelector = createSelector(
  fetchingData,
  modal,
  torrentList,
  (fetchingData, modal, torrentList) => {
    return {
      fetchingData,
      modal,
      torrentList
    };
  }
);

export default uiSelector;
