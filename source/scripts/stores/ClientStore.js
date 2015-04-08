var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ClientConstants = require('../constants/ClientConstants');
var assign = require('object-assign');

var _stats = {};

var ClientStore = assign({}, EventEmitter.prototype, {

    getStats: function() {
        return _stats;
    },

    emitChange: function() {
        this.emit(ClientConstants.CLIENT_STATS_CHANGE);
    },

    addChangeListener: function(callback) {
        this.on(ClientConstants.CLIENT_STATS_CHANGE, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(ClientConstants.CLIENT_STATS_CHANGE, callback);
    }

});

var dispatcherIndex = AppDispatcher.register(function(action) {

    var text;

    switch(action.actionType) {

        case ClientConstants.ADD_TORRENT:
            getClientStats();
            break;

        case ClientConstants.REMOVE_TORRENT:
            getClientStats();
            break;

        default:
            // nothing

    }
});

var getClientStats = function(callback) {


    $.ajax({
        url: '/client/stats',
        dataType: 'json',

        success: function(data) {

            _stats = {
                speed: {
                    upload: data.uploadRate,
                    download: data.downloadRate
                },
                transferred: {
                    upload: data.uploadTotal,
                    download: data.downloadTotal
                }
            };

            ClientStore.emitChange();

        }.bind(this),

        error: function(xhr, status, err) {
            console.error('/client/stats', status, err.toString());
        }.bind(this)
    });

};

getClientStats();
setInterval(getClientStats, 5000);

module.exports = ClientStore;
