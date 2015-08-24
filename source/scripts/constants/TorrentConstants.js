var keyMirror = require('keymirror');

module.exports = keyMirror({
  TORRENT_ADD_SUCCESS: 'torrent__add--success',
  TORRENT_ADD_FAIL: 'torrent__add--fail',
  TORRENT_CLICK: 'torrent--click',
  TORRENT_STOP_SUCCESS: 'torrent--stop',
  TORRENT_STOP_FAIL: 'torrent--stop',
  TORRENT_START_SUCCESS: 'torrent__start--success',
  TORRENT_START_FAIL: 'torrent__start--fail',
  TORRENT_LIST_CHANGE: 'torrent-list--change',
  TORRENT_SELECTION_CHANGE: 'torrent--select--change'
});
