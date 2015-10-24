import { createSelector } from 'reselect';

const fetchingDataSelector = (state) => {
  return state.ui.fetchingData;
}

const torrentListCountSelector = (state) => {
  return state.ui.torrentList.count;
};

const torrentListSortSelector = (state) => {
  return state.ui.torrentList.sortBy;
};

const torrentListSelector = createSelector(
  torrentListCountSelector,
  torrentListSortSelector,
  (count, sortBy) => {
    return {
      count,
      sortBy
    };
  }
);

const uiSelector = createSelector(
  fetchingDataSelector,
  torrentListSelector,
  (fetchingData, torrentList) => {
    return {
      fetchingData,
      torrentList
    };
  }
);

export default uiSelector;
