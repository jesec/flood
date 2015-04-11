var React = require('react');
var Torrent = require('./Torrent');
var TorrentStore = require('../../stores/TorrentStore')
var UIStore = require('../../stores/UIStore')

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
            selectedTorrents: [],
            allTorrents: {}
        };
    },

    componentDidMount: function() {
        TorrentStore.addChangeListener(this._onTorrentStoreChange);
        UIStore.addChangeListener(this._onUIStoreChange);
    },

    componentWillUnmount: function() {
        TorrentStore.removeChangeListener(this._onTorrentStoreChange);
        TorrentStore.removeChangeListener(this._onUIStoreChange);
    },

    render: function() {

        var torrents = this.state.allTorrents;

        var that = this;

        var torrentList = Object.keys(torrents).map(function(hash) {

            var isSelected = false;

            if (that.state.selectedTorrents.indexOf(hash) > -1) {
                isSelected = true;
            }

            return (
                <Torrent key={hash} data={torrents[hash]} selected={isSelected} />
            );
        });

        return (
            <ul className="torrent__list">
                <header className="torrent__header">
                    <span className="torrent__detail--primary">Name</span>
                    <div className="torrent__detail--secondary">
                        <span className="torrent__detail--secondary--sub">Up</span>
                        <span className="torrent__detail--secondary--sub">Down</span>
                        <span className="torrent__detail--secondary--sub">ETA</span>
                        <span className="torrent__detail--secondary--sub">Completed</span>
                        <span className="torrent__detail--secondary--sub">Size</span>
                        <span className="torrent__detail--secondary--sub">Ratio</span>
                        <span className="torrent__detail--secondary--sub">Peers</span>
                        <span className="torrent__detail--secondary--sub">Seeds</span>
                    </div>
                </header>
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
