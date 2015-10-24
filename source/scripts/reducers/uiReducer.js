const initialState = {
  fetchingData: true,
  torrentList: {
    count: 10,
    selected: null,
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

      if (event.shiftKey) {
        // if clicked torrent is in list, remove from list. else add clicked
        // torrent & all torrents in between
      } else if (event.metaKey || event.ctrlKey) {
        let hashPosition = selectedTorrents.indexOf(hash);
        if (hashPosition === -1) {
          // if the hash is not in the array, add it.
          selectedTorrents.push(hash);
        } else {
          // if the hash is in the array, remove it.
          selectedTorrents.splice(hashPosition, 1);
        }
      } else {
        // clicked torrent is only item in list.
        selectedTorrents = [hash];
      }
      console.log(selectedTorrents);
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
      break;
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

    default:
      return state;
  }
}
