var AppDispatcher = require('../dispatcher/AppDispatcher');
var TorrentConstants = require('../constants/TorrentConstants');
var $ = require('jquery');

var FilterActions = {

    searchTorrents: function(query) {
        AppDispatcher.dispatch({
            actionType: TorrentConstants.FILTER_SEARCH_CHANGE,
            query: query
        });
    },

    sortTorrents: function(property, direction) {
        AppDispatcher.dispatch({
            actionType: TorrentConstants.FILTER_SORT_CHANGE,
            property: property,
            direction: direction
        });
    }

}

module.exports = FilterActions;
