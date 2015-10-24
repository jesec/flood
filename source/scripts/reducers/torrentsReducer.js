export default function torrentsReducer(state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_TORRENTS':
      return Object.assign(
        [],
        state,
        action.payload.torrents
      );

    default:
      return state;
  }
}
