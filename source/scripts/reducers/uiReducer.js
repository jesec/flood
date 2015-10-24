const initialState = {
  fetchingData: true,
  torrentList: {
    count: 10,
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

      if (event.shiftKey) {

        if (selectedTorrents.length) {
          let lastHash = selectedTorrents[selectedTorrents.length - 1];
          let currentHashIndex;
          let lastHashIndex;

          // get the index of the last selected torrent.
          torrentList.some(function(torrent, index) {
            if (torrent.hash === lastHash) {
              lastHashIndex = index;
              return true;
            }
          });

          // get the index of the newly selected torrent.
          torrentList.some(function(torrent, index) {
            if (torrent.hash === hash) {
              currentHashIndex = index;
              return true;
            }
          });

          // from the previously selected index to the currently selected index,
          // add all torrent hashes to the selected array.
          // if the newly selcted hash is larger than the previous, start from
          // the newly selected hash and work backwards. otherwise go forwards.
          let increment = 1;

          if (currentHashIndex > lastHashIndex) {
            increment = -1;
          }

          while (currentHashIndex !== lastHashIndex) {
            let foundHash = torrentList[currentHashIndex].hash;
            // if the torrent isn't already selected, add the hash to the array.
            if (selectedTorrents.indexOf(foundHash) === -1) {
              selectedTorrents.push(foundHash);
            }
            currentHashIndex += increment;
          }
        } else {
          selectedTorrents = [hash];
        }

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
