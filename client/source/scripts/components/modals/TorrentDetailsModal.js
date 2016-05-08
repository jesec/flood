import React from 'react';

import Modal from './Modal';
import EventTypes from '../../constants/EventTypes';
import TorrentFiles from '../torrent-details/TorrentFiles';
import TorrentGeneralInfo from '../torrent-details/TorrentGeneralInfo';
import TorrentHeading from '../torrent-details/TorrentHeading';
import TorrentPeers from '../torrent-details/TorrentPeers';
import TorrentStore from '../../stores/TorrentStore';
import TorrentTrackers from '../torrent-details/TorrentTrackers';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

const METHODS_TO_BIND = ['onTorrentDetailsChange', 'onReceiveTorrentsSuccess'];

export default class TorrentDetailsModal extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      torrentDetails: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.setState({
      torrent: TorrentStore.getTorrent(UIStore.getTorrentDetailsHash()),
      torrentDetails: TorrentStore.getTorrentDetails(UIStore.getTorrentDetailsHash())
    });
  }

  componentDidMount() {
    TorrentStore.listen(EventTypes.CLIENT_TORRENT_DETAILS_CHANGE, this.onTorrentDetailsChange);
    TorrentStore.listen(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS, this.onReceiveTorrentsSuccess);
    TorrentStore.fetchTorrentDetails();
  }

  componentWillUnmount() {
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENT_DETAILS_CHANGE, this.onTorrentDetailsChange);
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS, this.onReceiveTorrentsSuccess);
    TorrentStore.stopPollingTorrentDetails();
  }

  onReceiveTorrentsSuccess() {
    this.setState({
      torrent: TorrentStore.getTorrent(UIStore.getTorrentDetailsHash())
    });
  }

  onTorrentDetailsChange() {
    this.setState({
      torrentDetails: TorrentStore.getTorrentDetails(UIStore.getTorrentDetailsHash())
    });
  }

  dismissModal() {
    UIActions.dismissModal();
  }

  getModalHeading() {
    return (
      <TorrentHeading torrent={this.state.torrent}
        key="torrent-heading" />
    );
  }

  render() {
    let props = {
      ...this.props.options,
      torrent: this.state.torrent,
      ...this.state.torrentDetails
    };

    let tabs = {
      'torrent-details': {
        content: TorrentGeneralInfo,
        label: 'Details',
        props
      },
      'torrent-files': {
        content: TorrentFiles,
        label: 'Files',
        props
      },
      'torrent-peers': {
        content: TorrentPeers,
        label: 'Peers',
        props
      },
      'torrent-trackers': {
        content: TorrentTrackers,
        label: 'Trackers',
        props
      }
    };

    return (
      <Modal heading={this.getModalHeading()} dismiss={this.dismissModal}
        size="large" tabs={tabs} orientation="vertical" tabsInBody={true} />
    );
  }
}
