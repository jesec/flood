var React = require('react');
var Torrent = require('./Torrent');
var TorrentStore = require('../../stores/TorrentStore');
var UIStore = require('../../stores/UIStore');

var getTorrentList = function() {

    return {
        allTorrents: TorrentStore.getAll()
    }
};

var getSelectedTorrents = function() {

    return {
        selectedTorrents: UIStore.getSelectedTorrents()
    }
};

var TorrentList = React.createClass({

    getInitialState: function() {

        return {
            allTorrents: [],
            selectedTorrents: []
        };
    },

    componentDidMount: function() {
        TorrentStore.addChangeListener(this._onTorrentStoreChange);
        UIStore.addChangeListener(this._onUIStoreChange);

    },

    componentWillUnmount: function() {
        TorrentStore.removeChangeListener(this._onTorrentStoreChange);
        UIStore.removeChangeListener(this._onUIStoreChange);
    },

    render: function() {

        var torrents = this.state.allTorrents;

        var that = this;

        var torrentList = torrents.map(function(torrent) {

            var isSelected = false;
            var hash = torrent.hash;

            if (that.state.selectedTorrents.indexOf(hash) > -1) {
                isSelected = true;
            }

            return (
                <Torrent key={hash} data={torrent} selected={isSelected} />
            );
        });

        return (
            <ul className="torrent__list">
                {torrentList}
            </ul>
        );
    },

    _onTorrentStoreChange: function() {
        this.setState(getTorrentList);
    },

    _onUIStoreChange: function() {
        this.setState(getSelectedTorrents);
    }

});

module.exports = TorrentList;
