var React = require('react');
var FilterBar = require('./filter-bar/FilterBar');
var ActionBar = require('./action-bar/ActionBar');
var TorrentList = require('./torrent-list/TorrentList');

var FloodApp = React.createClass({

    getInitialState: function() {
        return null;
    },

    render: function() {

        return (
            <div className="flood">
                <FilterBar />
                <div className="main">
                    <ActionBar />
                    <TorrentList />
                </div>
            </div>
        );
    }

});

module.exports = FloodApp;
