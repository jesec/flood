import _ from 'lodash';
import classNames from 'classnames';
import React from 'react';
import CSSTransitionGroup from 'react-addons-css-transition-group';

import ApplicationPanel from '../layout/ApplicationPanel';
import Download from '../icons/Download';
import EventTypes from '../../constants/EventTypes';
import ETA from '../icons/ETA';
import format from '../../util/formatData';
import Ratio from '../../components/icons/Ratio';
import TorrentActions from '../../actions/TorrentActions';
import TorrentFiles from '../torrent-details/TorrentFiles';
import TorrentPeers from '../torrent-details/TorrentPeers';
import TorrentStore from '../../stores/TorrentStore';
import TorrentTrackers from '../torrent-details/TorrentTrackers';
import UIStore from '../../stores/UIStore';
import Upload from '../icons/Upload';

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

  getSidePanel() {
    let torrentDetailsContent = null;

    if (this.state.isOpen) {
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

      torrentDetailsContent = (
        <div className="torrent-details" key={this.state.isOpen}>
          {this.getHeading()}
          <ul className="torrent-details__transfer-data torrent-details__section">
            <li className="transfer-data transfer-data--download">
              <Download />
              {downloadRate.value}
              <em className="unit">{downloadRate.unit}</em>
            </li>
            <li className="transfer-data transfer-data--upload">
              <Upload />
              {uploadRate.value}
              <em className="unit">{uploadRate.unit}</em>
            </li>
            <li className="transfer-data transfer-data--ratio">
              <Ratio />
              {ratio}
            </li>
            <li className="transfer-data transfer-data--eta">
              <ETA />
              {eta}
            </li>
          </ul>

          <TorrentTrackers trackers={torrentDetails.trackers} />
          <TorrentFiles files={torrentDetails.files} torrent={torrent} />
          <TorrentPeers peers={torrentDetails.peers} />
        </div>
      );
    }

    return (
      <ApplicationPanel modifier="torrent-details">
        {torrentDetailsContent}
      </ApplicationPanel>
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
