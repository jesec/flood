var React = require('react');
var FilterBar = require('./filter-bar/FilterBar');
var TorrentList = require('./torrent-list/TorrentList');

var FloodApp = React.createClass({

    getInitialState: function() {
        return null;
    },

    componentDidMount: function() {

    },

    render: function() {

        return (
            <div className="flood">
                <FilterBar />
                <TorrentList />
            </div>
        );
    }
});

module.exports = FloodApp;
