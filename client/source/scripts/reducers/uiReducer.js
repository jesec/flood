const initialState = {
  fetchingData: true,
  modal: null,
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
};

export default function uiReducer(state = initialState, action) {
  switch (action.type) {
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

    case 'UI_DISPLAY_MODAL':
      return Object.assign(
        {},
        state,
        {
          ...state,
          modal: action.payload.modal
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
