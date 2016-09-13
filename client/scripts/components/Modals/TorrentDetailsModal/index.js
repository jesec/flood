import {formatMessage, injectIntl} from 'react-intl';
import React from 'react';

import Modal from '../Modal';
import EventTypes from '../../../constants/EventTypes';
import TorrentFiles from './TorrentFiles';
import TorrentGeneralInfo from './TorrentGeneralInfo';
import TorrentHeading from './TorrentHeading';
import TorrentPeers from './TorrentPeers';
import TorrentStore from '../../../stores/TorrentStore';
import TorrentTrackers from './TorrentTrackers';
import UIActions from '../../../actions/UIActions';
import UIStore from '../../../stores/UIStore';

const METHODS_TO_BIND = [
  'onTorrentDetailsChange',
  'onReceiveTorrentsSuccess'
];

class TorrentDetailsModal extends React.Component {
  constructor() {
    super();

    this.state = {
      torrent: null,
      torrentDetails: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.setState({
      torrent: TorrentStore.getTorrent(UIStore.getTorrentDetailsHash()),
      torrentDetails: TorrentStore.getTorrentDetails(
        UIStore.getTorrentDetailsHash())
    });
  }

  componentDidMount() {
    TorrentStore.listen(EventTypes.CLIENT_TORRENT_DETAILS_CHANGE,
      this.onTorrentDetailsChange);
    TorrentStore.listen(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS,
      this.onReceiveTorrentsSuccess);
    TorrentStore.fetchTorrentDetails();
  }

  componentWillUnmount() {
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENT_DETAILS_CHANGE,
      this.onTorrentDetailsChange);
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS,
      this.onReceiveTorrentsSuccess);
    TorrentStore.stopPollingTorrentDetails();
  }

  onReceiveTorrentsSuccess() {
    this.setState({
      torrent: TorrentStore.getTorrent(UIStore.getTorrentDetailsHash())
    });
  }

  onTorrentDetailsChange() {
    this.setState({
      torrentDetails: TorrentStore.getTorrentDetails(
        UIStore.getTorrentDetailsHash())
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
        label: this.props.intl.formatMessage({
          id: 'torrents.details.details',
          defaultMessage: 'Details'
        }),
        props
      },
      'torrent-files': {
        content: TorrentFiles,
        label: this.props.intl.formatMessage({
          id: 'torrents.details.files',
          defaultMessage: 'Files'
        }),
        modalContentClasses: 'modal__content--nested-scroll',
        props
      },
      'torrent-peers': {
        content: TorrentPeers,
        label: this.props.intl.formatMessage({
          id: 'torrents.details.peers',
          defaultMessage: 'Peers'
        }),
        props
      },
      'torrent-trackers': {
        content: TorrentTrackers,
        label: this.props.intl.formatMessage({
          id: 'torrents.details.trackers',
          defaultMessage: 'Trackers'
        }),
        props
      }
    };

    return (
      <Modal heading={this.getModalHeading()} dismiss={this.dismissModal}
        size="large" tabs={tabs} orientation="vertical" tabsInBody={true} />
    );
  }
}

export default injectIntl(TorrentDetailsModal);
