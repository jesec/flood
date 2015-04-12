var keyMirror = require('keymirror');

module.exports = keyMirror({
    TORRENT_CLICK: 'torrent--click',
    TORRENT_STOP: 'torrent--stop',
    TORRENT_START: 'torrent--start',
    TORRENT_LIST_CHANGE: 'torrent-list--change',
    TORRENT_SELECT_CHANGE: 'torrent--select--change',
    FILTER_SORT_CHANGE: 'filter--sort--change',
    FILTER_SEARCH_CHANGE: 'filter--search--change',
});
