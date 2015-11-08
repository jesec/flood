import { selectTorrents } from '../util/selectTorrents';

const initialState = {
  fetchingData: true,
  torrentList: {
    count: 10,
    filterBy: 'all',
    searchString: '',
    selected: [],
    sortBy: {
      direction: 'asc',
      displayName: 'Date Added',
      property: 'added'
    }
  }
}

export default function uiReducer(state = initialState, action) {
  switch (action.type) {
    case 'CLICK_TORRENT':
      let event = action.payload.event;
      let hash = action.payload.hash;
      let selectedTorrents = Object.assign([], state.torrentList.selected);
      let torrentList = action.payload.torrentList;

      selectedTorrents = selectTorrents({
        event,
        hash,
        selectedTorrents,
        torrentList
      });

      return Object.assign(
        {},
        state,
        {
          ...state,
          torrentList: {
            ...state.torrentList,
            selected: selectedTorrents
          }
        }
      );

    case 'REQUEST_TORRENTS':
      return Object.assign(
        {},
        state,
        {
          ...state,
          fetchingData: true
        }
      );

    case 'RECEIVE_TORRENTS':
      return Object.assign(
        {},
        state,
        {
          ...state,
          fetchingData: false,
          torrentList: {
            ...state.torrentList,
            count: action.payload.torrents.length
          }
        }
      );

    case 'UI_SEARCH_TORRENTS':
      return Object.assign(
        {},
        state,
        {
          ...state,
          torrentList: {
            ...state.torrentList,
            searchString: action.payload.searchString
          }
        }
      );

    case 'UI_SORT_TORRENTS':
      return Object.assign(
        {},
        state,
        {
          ...state,
          torrentList: {
            ...state.torrentList,
            sortBy: action.payload.sortBy
          }
        }
      );

    case 'UI_FILTER_TORRENTS':
      return Object.assign(
        {},
        state,
        {
          ...state,
          torrentList: {
            ...state.torrentList,
            filterBy: action.payload.filterBy
          }
        }
      );

    default:
      return state;
  }
}
