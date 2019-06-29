import {injectIntl} from 'react-intl';
import React from 'react';

import connectStores from '../../../util/connectStores';
import Modal from '../Modal';
import EventTypes from '../../../constants/EventTypes';
import TorrentMediainfo from './TorrentMediainfo';
import TorrentFiles from './TorrentFiles';
import TorrentGeneralInfo from './TorrentGeneralInfo';
import TorrentHeading from './TorrentHeading';
import TorrentPeers from './TorrentPeers';
import TorrentStore from '../../../stores/TorrentStore';
import TorrentTrackers from './TorrentTrackers';
import UIActions from '../../../actions/UIActions';
import UIStore from '../../../stores/UIStore';

class TorrentDetailsModal extends React.Component {
  componentDidMount() {
    TorrentStore.fetchTorrentDetails();
  }

  componentWillUnmount() {
    TorrentStore.stopPollingTorrentDetails();
  }

  dismissModal() {
    UIActions.dismissModal();
  }

  getModalHeading() {
    return <TorrentHeading torrent={this.props.torrent} key="torrent-heading" />;
  }

  render() {
    const props = {
      ...this.props.options,
      torrent: this.props.torrent,
      ...this.props.torrentDetails,
    };

    const tabs = {
      'torrent-details': {
        content: TorrentGeneralInfo,
        label: this.props.intl.formatMessage({
          id: 'torrents.details.details',
          defaultMessage: 'Details',
        }),
        props,
      },
      'torrent-files': {
        content: TorrentFiles,
        label: this.props.intl.formatMessage({
          id: 'torrents.details.files',
          defaultMessage: 'Files',
        }),
        modalContentClasses: 'modal__content--nested-scroll',
        props,
      },
      'torrent-peers': {
        content: TorrentPeers,
        label: this.props.intl.formatMessage({
          id: 'torrents.details.peers',
          defaultMessage: 'Peers',
        }),
        props,
      },
      'torrent-trackers': {
        content: TorrentTrackers,
        label: this.props.intl.formatMessage({
          id: 'torrents.details.trackers',
          defaultMessage: 'Trackers',
        }),
        props,
      },
      'torrent-mediainfo': {
        content: TorrentMediainfo,
        label: this.props.intl.formatMessage({
          id: 'torrents.details.mediainfo',
          defaultMessage: 'Mediainfo',
        }),
        props,
      },
    };

    return (
      <Modal
        heading={this.getModalHeading()}
        dismiss={this.dismissModal}
        size="large"
        tabs={tabs}
        orientation="vertical"
        tabsInBody
      />
    );
  }
}

const ConnectedTorrentDetailsModal = connectStores(injectIntl(TorrentDetailsModal), () => {
  return [
    {
      store: TorrentStore,
      event: EventTypes.CLIENT_TORRENT_DETAILS_CHANGE,
      getValue: ({store}) => {
        return {
          torrentDetails: store.getTorrentDetails(UIStore.getTorrentDetailsHash()),
        };
      },
    },
    {
      store: TorrentStore,
      event: EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS,
      getValue: ({store}) => {
        return {
          torrent: store.getTorrent(UIStore.getTorrentDetailsHash()),
        };
      },
    },
  ];
});

export default ConnectedTorrentDetailsModal;
