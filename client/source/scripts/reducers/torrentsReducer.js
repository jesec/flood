import { selectTorrents } from '../util/selectTorrents';

const initialState = {
  selectedTorrents: [],
  torrents: []
};

export default function torrentsReducer(state = initialState, action) {
  switch (action.type) {
    case 'CLICK_TORRENT':
      let event = action.payload.event;
      let hash = action.payload.hash;
      let selectedTorrents = Object.assign([], state.selectedTorrents);
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
          selectedTorrents: selectedTorrents
        }
      );

    case 'RECEIVE_TORRENTS':
      return Object.assign(
        {},
        state,
        {
          ...state,
          torrents: action.payload.torrents
        }
      );

    default:
      return state;
  }
}
