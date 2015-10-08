import keyMirror from 'keymirror';

const ClientConstants = keyMirror({
  ADD_TORRENT: 'client--add-torrent',
  REMOVE_TORRENT: 'client--remove-torrent',
  CLIENT_STATS_CHANGE: 'client--stats-change'
});

export default ClientConstants;
