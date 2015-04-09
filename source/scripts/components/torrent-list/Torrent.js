var React = require('react');
var TorrentActions = require('../../actions/TorrentActions');
var ProgressBar = require('./ProgressBar');
var format = require('../../helpers/formatData');

var Torrent = React.createClass({

    getInitialState: function() {

        return null;
    },

    render: function() {

        var torrent = this.props.data;

        console.log(torrent);

        var uploadRate = format.data(torrent.uploadRate, '/s');
        var uploadTotal = format.data(torrent.uploadTotal);
        var downloadRate = format.data(torrent.downloadRate, '/s');
        var downloadTotal = format.data(torrent.downloadTotal);

        return (
            <li className="torrent">
                <div className="torrent__details">
                    <span className="torrent__detail--primary">{torrent.name}</span>
                    <ul className="torrent__detail--list torrent__detail--secondary">
                        <li className="torrent__detail--secondary--sub">{torrent.state}</li>
                        <li className="torrent__detail--secondary--sub">
                            {uploadRate.value}
                            <em className="unit">{uploadRate.unit}</em>
                        </li>
                        <li className="torrent__detail--secondary--sub">
                            {uploadTotal.value}
                            <em className="unit">{uploadTotal.unit}</em>
                        </li>
                        <li className="torrent__detail--secondary--sub">
                            {downloadRate.value}
                            <em className="unit">{downloadRate.unit}</em>
                        </li>
                        <li className="torrent__detail--secondary--sub">
                            {downloadTotal.value}
                            <em className="unit">{downloadTotal.unit}</em>
                        </li>
                        <li className="torrent__detail--secondary--sub">
                            {torrent.ratio}
                        </li>
                        <li className="torrent__detail--secondary--sub" onClick={this._onStart}>
                            Start
                        </li>
                        <li className="torrent__detail--secondary--sub" onClick={this._onStop}>
                            Stop
                        </li>
                    </ul>
                </div>
                <ProgressBar percent={torrent.percentComplete} />
            </li>
        );
    },

    _onStop: function() {
        TorrentActions.stop(this.props.data.hash);
    },

    _onStart: function() {
        TorrentActions.start(this.props.data.hash);
    }
});

module.exports = Torrent;
