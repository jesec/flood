import { createSelector } from 'reselect';

const torrentSelector = (state) => {
  return state.torrents;
};

export default torrentSelector;
