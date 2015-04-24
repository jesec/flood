var AppDispatcher = require('../dispatcher/AppDispatcher');
var TorrentConstants = require('../constants/TorrentConstants');
var UIConstants = require('../constants/UIConstants');

var UIActions = {

    searchTorrents: function(query) {
        console.log('search action called');
        AppDispatcher.dispatch({
            actionType: TorrentConstants.FILTER_SEARCH_CHANGE,
            query: query
        });
    },

    sortTorrents: function(property, direction) {
        AppDispatcher.dispatch({
            actionType: UIConstants.FILTER_SORT_CHANGE,
            property: property,
            direction: direction
        });
    },

    setViewportHeight: function(height) {
        AppDispatcher.dispatch({
            actionType: UIConstants.TORRENT_LIST_VIEWPORT_RESIZE,
            viewportHeight: height
        });
    },

    scrollTorrentList: function(torrentCount) {
        AppDispatcher.dispatch({
            actionType: UIConstants.TORRENT_LIST_SCROLL,
            torrentCount: torrentCount
        });
    }

}

module.exports = UIActions;
