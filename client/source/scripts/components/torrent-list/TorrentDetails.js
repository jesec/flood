import _ from 'lodash';
import classNames from 'classnames';
import React from 'react';
import CSSTransitionGroup from 'react-addons-css-transition-group';

import TorrentFiles from './TorrentFiles';
import EventTypes from '../../constants/EventTypes';
import format from '../../util/formatData';
import Icon from '../icons/Icon';
import TorrentActions from '../../actions/TorrentActions';
import TorrentStore from '../../stores/TorrentStore';
import UIStore from '../../stores/UIStore';

const METHODS_TO_BIND = [
  'onTorrentDetailsHashChange',
  'onOpenChange',
  'onTorrentDetailsChange',
  'getHeading',
  'getSidePanel'
];

export default class TorrentDetails extends React.Component {
  constructor() {
    super();

    this.state = {
      isOpen: false,
      torrentDetailsSuccess: false,
      torrentDetailsError: false,
      selectedTorrent: {},
      selectedTorrentHash: null,
      torrentDetails: {}
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    TorrentStore.listen(EventTypes.CLIENT_TORRENT_DETAILS_CHANGE, this.onTorrentDetailsChange);
    UIStore.listen(EventTypes.UI_TORRENT_DETAILS_OPEN_CHANGE, this.onOpenChange);
    UIStore.listen(EventTypes.UI_TORRENT_DETAILS_HASH_CHANGE, this.onTorrentDetailsHashChange);
  }

  componentWillUnmount() {
    TorrentStore.stopPollingTorrentDetails();
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENT_DETAILS_CHANGE, this.onTorrentDetailsChange);
    UIStore.unlisten(EventTypes.UI_TORRENT_DETAILS_OPEN_CHANGE, this.onOpenChange);
    UIStore.unlisten(EventTypes.UI_TORRENT_DETAILS_HASH_CHANGE, this.onTorrentDetailsHashChange);
  }

  onTorrentDetailsHashChange() {
    if (UIStore.isTorrentDetailsOpen()) {
      TorrentStore.fetchTorrentDetails(UIStore.getTorrentDetailsHash());
    }
  }

  onOpenChange() {
    if (!UIStore.isTorrentDetailsOpen()) {
      TorrentStore.stopPollingTorrentDetails();
    } else {
      TorrentStore.fetchTorrentDetails(UIStore.getTorrentDetailsHash());
    }

    this.setState({
      isOpen: UIStore.isTorrentDetailsOpen()
    });
  }

  onTorrentDetailsChange() {
    this.setState({
      torrentDetails: TorrentStore.getTorrentDetails(UIStore.getTorrentDetailsHash())
    });
  }

  getHeading() {
    // return (
    //   <div className="torrent-details__actions torrent-details__section">
    //     Dropdown
    //   </div>
    // );
  }

  getPeerList(peers) {
    if (peers) {
      let peerList = null;
      let peerCount = 0;

      peerList = peers.map(function(peer, index) {
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

      return (
        <div className="torrent-details__peers torrent-details__section">
          <table className="torrent-details__table table">
            <thead className="torrent-details__table__heading">
              <tr>
                <th>
                  Peers
                  <span className="torrent-details__table__heading__count">
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
        </div>
      )
    }
  }

  getSidePanel() {
    if (!this.state.isOpen) {
      return null;
    }

    let selectedHash = UIStore.getTorrentDetailsHash();
    let torrent = TorrentStore.getTorrent(selectedHash);
    let added = new Date(torrent.added * 1000);
    let addedString = (added.getMonth() + 1) + '/' + added.getDate() + '/' +
      added.getFullYear();
    let completed = format.data(torrent.bytesDone);
    let downloadRate = format.data(torrent.downloadRate, '/s');
    let downloadTotal = format.data(torrent.downloadTotal);
    let eta = format.eta(torrent.eta);
    let ratio = format.ratio(torrent.ratio);
    let totalSize = format.data(torrent.sizeBytes);
    let torrentDetails = this.state.torrentDetails || {};
    let uploadRate = format.data(torrent.uploadRate, '/s');
    let uploadTotal = format.data(torrent.uploadTotal);

    return (
      <div className="torrent-details" key={this.state.isOpen}>
        {this.getHeading()}
        <ul className="torrent-details__transfer-data torrent-details__section">
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
            {ratio}
          </li>
          <li className="transfer-data transfer-data--eta">
            <Icon icon="eta" />
            {eta}
          </li>
        </ul>
        {this.getTrackerList(torrentDetails.trackers)}
        <TorrentFiles files={torrentDetails.files} torrent={torrent} />
        {this.getPeerList(torrentDetails.peers)}
      </div>
    );
  }

  getTrackerList(trackers = []) {
    let trackerCount = trackers.length;
    let trackerTypes = ['http', 'udp', 'dht'];

    let trackerDetails = trackers.map((tracker, index) => {
      return (
        <tr key={index}>
          <td>
            {tracker.url}
          </td>
          <td>
            {trackerTypes[tracker.type - 1]}
          </td>
        </tr>
      );
    });

    return (
      <div className="torrent-details__peers torrent-details__section">
        <table className="torrent-details__table table">
          <thead className="torrent-details__table__heading">
            <tr>
              <th>
                Trackers
                <span className="torrent-details__table__heading__count">
                  {trackerCount}
                </span>
              </th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {trackerDetails}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    try {
      return (
        <CSSTransitionGroup
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
          transitionName="torrent-details">
          {this.getSidePanel()}
        </CSSTransitionGroup>
      );
    } catch (err) {
      console.trace(err);
    }
  }
}
