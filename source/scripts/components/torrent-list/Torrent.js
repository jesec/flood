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
      'is-stopped': torrent.status.indexOf('is-stopped') > -1,
      'is-paused': torrent.status.indexOf('is-paused') > -1,
      'is-actively-downloading': downloadRate.value > 0,
      'is-downloading': torrent.status.indexOf('is-downloading') > -1,
      'is-seeding': torrent.status.indexOf('is-seeding') > -1,
      'is-completed': torrent.status.indexOf('is-completed') > -1,
      'is-checking': torrent.status.indexOf('is-checking') > -1,
      'is-active': torrent.status.indexOf('is-active') > -1,
      'is-inactive': torrent.status.indexOf('is-inactive') > -1
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
            <span className="torrent__details--segment">
              {torrent.eta.weeks}<em className="unit">w</em>
            </span>
            <span className="torrent__details--segment">
              {torrent.eta.days}<em className="unit">d</em>
            </span>
          </span>
        );
      } else if (torrent.eta.days > 0) {
        return (
          <span>
            <span className="torrent__details--segment">
              {torrent.eta.days}<em className="unit">d</em>
            </span>
            <span className="torrent__details--segment">
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
            <span className="torrent__details--segment">
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
            <span className="torrent__details--segment">
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
      <li className={classes} onClick={this._onClick} onContextMenu={this._onRightClick}>
        <ul className="torrent__details">
          <li className="torrent__details--primary">
            {torrent.name}
          </li>
          <li className="torrent__details--secondary">
            <ul className="torrent__details">
              <li className="torrent__details--eta">
                {eta}
              </li>
              <li className="torrent__details--speed">
                {downloadRate.value}
                <em className="unit">{downloadRate.unit}</em>
              </li>
              <li className="torrent__details--speed">
                {uploadRate.value}
                <em className="unit">{uploadRate.unit}</em>
              </li>
              <li className="torrent__details--ratio">
                {torrent.ratio}
              </li>
            </ul>
          </li>
        </ul>
        <ul className="torrent__details torrent__details--tertiary">
          <li className="torrent__details--completed">
            {torrent.percentComplete}
            <em className="unit">%</em>
            &nbsp;&mdash;&nbsp;
            {completed.value}
            <em className="unit">{completed.unit}</em> Downloaded
          </li>
          <li className="torrent__details--uploaded">
            {uploadTotal.value}
            <em className="unit">{uploadTotal.unit}</em> Uploaded
          </li>
          <li className="torrent__details--size">
            {totalSize.value}
            <em className="unit">{totalSize.unit}</em> Size
          </li>
          <li className="torrent__details--peers">
            0/1 Peers
          </li>
          <li className="torrent__details--seeds">
            0/1 Seeds
          </li>
        </ul>
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
