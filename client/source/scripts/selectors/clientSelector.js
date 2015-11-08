import { createSelector } from 'reselect';

const clientSelector = (state) => {
  return state.client;
};

export default clientSelector;
