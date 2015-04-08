var AppDispatcher = require('../dispatcher/AppDispatcher');
var TorrentConstants = require('../constants/TorrentConstants');

var performAction = function(action, hash, success, error) {

    $.ajax({
        url: '/torrents/' + hash + '/' + action,
        dataType: 'json',

        success: function(data) {
            success(data);
        }.bind(this),

        error: function(xhr, status, err) {
            console.error(torrentsData, status, err.toString());
        }.bind(this)
    });
};

var TorrentActions = {

    stop: function(hash) {
        performAction('stop', hash, function(data) {
            AppDispatcher.dispatch({
                actionType: TorrentConstants.TORRENT_STOP
            });
        });
    },

    start: function(hash) {
        performAction('start', hash, function(data) {
            AppDispatcher.dispatch({
                actionType: TorrentConstants.TORRENT_START
            });
        });
    }

}

module.exports = TorrentActions;
