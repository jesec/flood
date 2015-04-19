var React = require('react');
var TorrentActions = require('../../actions/TorrentActions');
var ProgressBar = require('./ProgressBar');

var format = require('../../helpers/formatData');
var classNames = require('classnames');

var Torrent = React.createClass({

    getInitialState: function() {

        return null;
    },

    render: function() {

        var torrent = this.props.data;

        var uploadRate = format.data(torrent.uploadRate, '/s');
        var uploadTotal = format.data(torrent.uploadTotal);
        var downloadRate = format.data(torrent.downloadRate, '/s');
        var downloadTotal = format.data(torrent.downloadTotal);
        var completed = format.data(torrent.bytesDone);
        var totalSize = format.data(torrent.sizeBytes);

        var classes = classNames({
            'torrent': true,
            'is-selected': this.props.selected,
            'is-stopped': torrent.status === 'stopped',
            'is-paused': torrent.status === 'paused',
            'is-downloading': torrent.status === 'downloading',
            'is-seeding': torrent.status === 'seeding',
            'is-finished': torrent.status === 'finished',
            'is-checking': torrent.status === 'checking'
        });

        var eta = (function() {

            if (torrent.eta === 'Infinity') {
                return '∞';
            } else if (torrent.eta.years > 0) {
                return (
                    <span>
                        {torrent.eta.years}<em className="unit">y</em>
                    </span>
                );
            } else if (torrent.eta.weeks > 0) {
                return (
                    <span>
                        <span className="torrent__detail--segment">
                            {torrent.eta.weeks}<em className="unit">w</em>
                        </span>
                        <span className="torrent__detail--segment">
                            {torrent.eta.days}<em className="unit">d</em>
                        </span>
                    </span>
                );
            } else if (torrent.eta.days > 0) {
                return (
                    <span>
                        <span className="torrent__detail--segment">
                            {torrent.eta.days}<em className="unit">d</em>
                        </span>
                        <span className="torrent__detail--segment">
                            {torrent.eta.hours}<em className="unit">h</em>
                        </span>
                    </span>
                );
            } else if (torrent.eta.hours > 0) {
                return (
                    <span>
                        <span>
                            {torrent.eta.hours}<em className="unit">h</em>
                        </span>
                        <span className="torrent__detail--segment">
                            {torrent.eta.minutes}<em className="unit">m</em>
                        </span>
                    </span>
                );
            } else if (torrent.eta.minutes > 0) {
                return (
                    <span>
                        <span>
                            {torrent.eta.minutes}<em className="unit">m</em>
                        </span>
                        <span className="torrent__detail--segment">
                            {torrent.eta.seconds}<em className="unit">s</em>
                        </span>
                    </span>
                );
            } else {
                return (
                    <span>
                        {torrent.eta.seconds}<em className="unit">s</em>
                    </span>
                );
            }

        })();

        return (
            <li className={classes} onClick={this._onClick} onContextMenu={this._onRightClick} title={torrent.status}>
                <div className="torrent__details">
                    <span className="torrent__detail--primary">{torrent.name}</span>
                    <ul className="torrent__detail--list torrent__detail--secondary">
                        <li className="torrent__detail--secondary--sub torrent__detail--speed">
                            {uploadRate.value}
                            <em className="unit">{uploadRate.unit}</em>
                        </li>
                        <li className="torrent__detail--secondary--sub torrent__detail--speed">
                            {downloadRate.value}
                            <em className="unit">{downloadRate.unit}</em>
                        </li>
                        <li className="torrent__detail--secondary--sub torrent__detail--eta">
                            {eta}
                        </li>
                        <li className="torrent__detail--secondary--sub torrent__detail--completed">
                            <span className="torrent__detail--segment">
                                {torrent.percentComplete}
                                <em className="unit">%</em>
                            </span>
                            <span className="torrent__detail--segment">
                                {completed.value}
                                <em className="unit">{completed.unit}</em>
                            </span>
                        </li>
                        <li className="torrent__detail--secondary--sub torrent__detail--size">
                            {totalSize.value}
                            <em className="unit">{totalSize.unit}</em>
                        </li>
                        <li className="torrent__detail--secondary--sub torrent__detail--ratio">
                            {torrent.ratio}
                        </li>
                        <li className="torrent__detail--secondary--sub torrent__detail--peers">
                            # / #
                        </li>
                        <li className="torrent__detail--secondary--sub torrent__detail--seeds">
                            # / #
                        </li>
                    </ul>
                </div>
                <ProgressBar percent={torrent.percentComplete} />
            </li>
        );
    },

    _onClick: function() {
        TorrentActions.click(this.props.data.hash);
    },

    _onRightClick: function() {
        console.log(event);
    }

});

module.exports = Torrent;
