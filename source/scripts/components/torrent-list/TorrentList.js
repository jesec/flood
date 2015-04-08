var React = require('react');
var Torrent = require('./Torrent');
var TorrentStore = require('../../stores/TorrentStore.js')

var getTorrentList = function() {
    return {
        allTorrents: TorrentStore.getAll()
    }
}

var TorrentList = React.createClass({

    getInitialState: function() {

        return {
            allTorrents: []
        };
    },

    componentDidMount: function() {
        TorrentStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        TorrentStore.removeChangeListener(this._onChange);
    },

    render: function() {

        var torrents = this.state.allTorrents;

        var torrentList = torrents.map(function(torrent) {

            return (
                <Torrent key={torrent.hash} data={torrent} />
            );
        });

        return (
            <ul className="torrent__list">
                <header className="torrent__header">
                    <span className="torrent__detail--primary">Name</span>
                    <div className="torrent__detail--secondary">
                        <span className="torrent__detail--secondary--sub">State</span>
                        <span className="torrent__detail--secondary--sub">Up</span>
                        <span className="torrent__detail--secondary--sub">&nbsp;</span>
                        <span className="torrent__detail--secondary--sub">Down</span>
                        <span className="torrent__detail--secondary--sub">&nbsp;</span>
                        <span className="torrent__detail--secondary--sub">Ratio</span>
                        <span className="torrent__detail--secondary--sub">Start</span>
                        <span className="torrent__detail--secondary--sub">Stop</span>
                    </div>
                </header>
                {torrentList}
            </ul>
        );
    },

    _onChange: function() {
        this.setState(getTorrentList);
    }

});

module.exports = TorrentList;
