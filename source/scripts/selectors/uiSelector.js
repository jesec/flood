import { createSelector } from 'reselect';

const fetchingData = (state) => {
  return state.ui.fetchingData;
}

const torrentListCount = (state) => {
  return state.ui.torrentList.count;
};

const torrentListSelected = (state) => {
  return state.ui.torrentList.selected;
}

const torrentListSort = (state) => {
  return state.ui.torrentList.sortBy;
};

const torrentList = createSelector(
  torrentListCount,
  torrentListSelected,
  torrentListSort,
  (count, selected, sortBy) => {
    return {
      count,
      selected,
      sortBy
    };
  }
);

const uiSelector = createSelector(
  fetchingData,
  torrentList,
  (fetchingData, torrentList) => {
    return {
      fetchingData,
      torrentList
    };
  }
);

export default uiSelector;
