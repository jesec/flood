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
                <li className="torrent__header">
                    <span className="torrent__detail--primary">Name</span>
                    <div className="torrent__detail--secondary">
                        <span className="torrent__detail--secondary--sub torrent__detail--speed">Up</span>
                        <span className="torrent__detail--secondary--sub torrent__detail--speed">Down</span>
                        <span className="torrent__detail--secondary--sub torrent__detail--eta">ETA</span>
                        <span className="torrent__detail--secondary--sub torrent__detail--completed">Completed</span>
                        <span className="torrent__detail--secondary--sub torrent__detail--size">Size</span>
                        <span className="torrent__detail--secondary--sub torrent__detail--ratio">Ratio</span>
                        <span className="torrent__detail--secondary--sub torrent__detail--peers">Peers</span>
                        <span className="torrent__detail--secondary--sub torrent__detail--seeds">Seeds</span>
                    </div>
                </li>
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
