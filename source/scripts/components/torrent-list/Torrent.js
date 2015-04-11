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

        var classes = classNames({
            'torrent': true,
            'is-selected': this.props.selected
        });

        var torrent = this.props.data;

        var uploadRate = format.data(torrent.uploadRate, '/s');
        var uploadTotal = format.data(torrent.uploadTotal);
        var downloadRate = format.data(torrent.downloadRate, '/s');
        var downloadTotal = format.data(torrent.downloadTotal);
        var completed = format.data(torrent.bytesDone);
        var totalSize = format.data(torrent.sizeBytes);

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
                        {torrent.eta.weeks}<em className="unit">w</em>
                        {torrent.eta.days}<em className="unit">d</em>
                    </span>
                );
            } else if (torrent.eta.days > 0) {
                return (
                    <span>
                        {torrent.eta.days}<em className="unit">d</em>
                        {torrent.eta.hours}<em className="unit">h</em>
                    </span>
                );
            } else if (torrent.eta.hours > 0) {
                return (
                    <span>
                        {torrent.eta.hours}<em className="unit">h</em>
                        {torrent.eta.minutes}<em className="unit">m</em>
                    </span>
                );
            } else if (torrent.eta.minutes > 0) {
                return (
                    <span>
                        {torrent.eta.minutes}<em className="unit">m</em>
                        {torrent.eta.seconds}<em className="unit">s</em>
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
            <li className={classes} onClick={this._onClick}>
                <div className="torrent__details">
                    <span className="torrent__detail--primary">{torrent.name}: {torrent.state}</span>
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
                            <span>
                                {torrent.percentComplete}
                                <em className="unit">%</em>
                            </span>
                            <span>
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
                            Prs
                        </li>
                        <li className="torrent__detail--secondary--sub torrent__detail--seeds">
                            Sds
                        </li>
                    </ul>
                </div>
                <ProgressBar percent={torrent.percentComplete} />
            </li>
        );
    },

    _onClick: function() {
        TorrentActions.click(this.props.data.hash);
    }

});

module.exports = Torrent;
