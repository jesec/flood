import _ from 'lodash';
import classNames from 'classnames';
import {connect} from 'react-redux';
import React from 'react';
import CSSTransitionGroup from 'react-addons-css-transition-group';

import format from '../../util/formatData';
import Icon from '../icons/Icon';
import clientSelector from '../../selectors/clientSelector';

const methodsToBind = [
  'getSidePanel',
  'getEta',
  'getRatio'
];

class TorrentDetails extends React.Component {

  constructor() {
    super();

    this.state = {
      selectedTorrentHash: null
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible === true) {
      let nextHash = nextProps.selectedTorrents[0];
      if (this.state.selectedTorrentHash !== nextHash) {
        this.setState({
          selectedTorrentHash: nextHash,
          selectedTorrent: _.find(nextProps.torrents, torrent => {
            return torrent.hash === nextHash;
          })
        });
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.visible === true || (nextProps.visible !== this.props.visible)) {
      return true;
    } else {
      return false;
    }
  }

  getPeerList() {
    let torrentDetails = this.props.torrentDetails[
      this.state.selectedTorrentHash
    ];

    let peerList = null;
    let peerCount = 0;

    if (torrentDetails) {
      peerList = torrentDetails.map(function(peer, index) {
        let downloadRate = format.data(peer.downloadRate, '/s');
        let uploadRate = format.data(peer.uploadRate, '/s');
        return (
          <tr key={index}>
            <td>{peer.address}</td>
            <td>
              {downloadRate.value}
              <em className="unit">{downloadRate.unit}</em>
            </td>
            <td>
              {uploadRate.value}
              <em className="unit">{uploadRate.unit}</em>
            </td>
          </tr>
        );
      });
      peerCount = peerList.length;
    }

    return (
      <table className="torrent-details__table table">
        <thead>
          <tr>
            <th>
              Peers
              <span className="table__heading--sub-heading">
                {peerCount}
              </span>
            </th>
            <th>DL</th>
            <th>UL</th>
          </tr>
        </thead>
        <tbody>
          {peerList}
        </tbody>
      </table>
    )
  }

  getEta(eta) {
    if (eta === 'Infinity') {
      return '∞';
    } else if (eta.years > 0) {
      return (
        <span>
          <span className="torrent__details--segment">
            {eta.years}<em className="unit">yr</em>
          </span>
          <span className="torrent__details--segment">
            {eta.weeks}<em className="unit">wk</em>
          </span>
        </span>
      );
    } else if (eta.weeks > 0) {
      return (
        <span>
          <span className="torrent__details--segment">
            {eta.weeks}<em className="unit">wk</em>
          </span>
          <span className="torrent__details--segment">
            {eta.days}<em className="unit">d</em>
          </span>
        </span>
      );
    } else if (eta.days > 0) {
      return (
        <span>
          <span className="torrent__details--segment">
            {eta.days}<em className="unit">d</em>
          </span>
          <span className="torrent__details--segment">
            {eta.hours}<em className="unit">hr</em>
          </span>
        </span>
      );
    } else if (eta.hours > 0) {
      return (
        <span>
          <span className="torrent__details--segment">
            {eta.hours}<em className="unit">hr</em>
          </span>
          <span className="torrent__details--segment">
            {eta.minutes}<em className="unit">m</em>
          </span>
        </span>
      );
    } else if (eta.minutes > 0) {
      return (
        <span>
          <span className="torrent__details--segment">
            {eta.minutes}<em className="unit">m</em>
          </span>
          <span className="torrent__details--segment">
            {eta.seconds}<em className="unit">s</em>
          </span>
        </span>
      );
    } else {
      return (
        <span>
          {eta.seconds}<em className="unit">s</em>
        </span>
      );
    }
  }

  getRatio(ratio) {
    ratio = ratio / 1000;
    let precision = 1;

    if (ratio < 10) {
      precision = 2;
    } else if (ratio < 100) {
      precision = 0;
    }

    return ratio.toFixed(precision);
  }

  getSidePanel() {
    if (!this.props.visible) {
      return null;
    }

    let torrent = this.state.selectedTorrent;
    let added = new Date(torrent.added * 1000);
    let addedString = (added.getMonth() + 1) + '/' + added.getDate() + '/' +
      added.getFullYear();
    let completed = format.data(torrent.bytesDone);
    let downloadRate = format.data(torrent.downloadRate, '/s');
    let downloadTotal = format.data(torrent.downloadTotal);
    let eta = this.getEta(torrent.eta);
    let ratio = this.getRatio(torrent.ratio);
    let totalSize = format.data(torrent.sizeBytes);
    let uploadRate = format.data(torrent.uploadRate, '/s');
    let uploadTotal = format.data(torrent.uploadTotal);

    return (
      <div className="torrent-details" key={this.props.visible}>
        <div className="torrent-details__actions">
          Dropdown
        </div>
        <ul className="torrent-details__transfer-data">
          <li className="transfer-data transfer-data--download">
            <Icon icon="download" />
            {downloadRate.value}
            <em className="unit">{downloadRate.unit}</em>
          </li>
          <li className="transfer-data transfer-data--upload">
            <Icon icon="upload" />
            {uploadRate.value}
            <em className="unit">{uploadRate.unit}</em>
          </li>
          <li className="transfer-data transfer-data--ratio">
            <Icon icon="ratio" />
            1<em className="unit">yr</em>
          </li>
          <li className="transfer-data transfer-data--eta">
            <Icon icon="download" />
            1<em className="unit">yr</em>
          </li>
        </ul>
        <div className="torrent-details__peers">
          {this.getPeerList()}
        </div>
      </div>
    );
  }

  render() {
    return (
      <CSSTransitionGroup
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        transitionName="torrent-details">
        {this.getSidePanel()}
      </CSSTransitionGroup>
    );
  }

}

export default connect(clientSelector)(TorrentDetails);
