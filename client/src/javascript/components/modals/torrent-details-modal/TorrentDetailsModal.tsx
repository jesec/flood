import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import type {TorrentDetails, TorrentProperties} from '@shared/types/Torrent';

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

export interface TorrentDetailsModalProps extends WrappedComponentProps {
  options: {hash: TorrentProperties['hash']};
  torrent?: TorrentProperties;
  torrentDetails?: TorrentDetails | null;
}

class TorrentDetailsModal extends React.Component<TorrentDetailsModalProps> {
  componentDidMount() {
    TorrentStore.fetchTorrentDetails(this.props.options.hash);
  }

  componentWillUnmount() {
    TorrentStore.stopPollingTorrentDetails();
  }

  getModalHeading() {
    if (this.props.torrent != null) {
      return <TorrentHeading torrent={this.props.torrent} key="torrent-heading" />;
    }
    return null;
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
        }),
        props,
      },
      'torrent-files': {
        content: TorrentFiles,
        label: this.props.intl.formatMessage({
          id: 'torrents.details.files',
        }),
        modalContentClasses: 'modal__content--nested-scroll',
        props,
      },
      'torrent-peers': {
        content: TorrentPeers,
        label: this.props.intl.formatMessage({
          id: 'torrents.details.peers',
        }),
        props,
      },
      'torrent-trackers': {
        content: TorrentTrackers,
        label: this.props.intl.formatMessage({
          id: 'torrents.details.trackers',
        }),
        props,
      },
      'torrent-mediainfo': {
        content: TorrentMediainfo,
        label: this.props.intl.formatMessage({
          id: 'torrents.details.mediainfo',
        }),
        props,
      },
    };

    return (
      <Modal
        heading={this.getModalHeading()}
        size="large"
        tabs={tabs}
        orientation={window.matchMedia('(max-width: 720px)').matches ? 'horizontal' : 'vertical'}
        {...(window.matchMedia('(max-width: 720px)').matches ? [] : {tabsInBody: true})}
      />
    );
  }
}

const ConnectedTorrentDetailsModal = connectStores<Omit<TorrentDetailsModalProps, 'intl'>, Record<string, unknown>>(
  injectIntl(TorrentDetailsModal),
  () => {
    return [
      {
        store: TorrentStore,
        event: EventTypes.CLIENT_TORRENT_DETAILS_CHANGE,
        getValue: ({props}) => {
          return {
            torrentDetails: TorrentStore.getTorrentDetails(props.options.hash),
          };
        },
      },
      {
        store: TorrentStore,
        event: EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS,
        getValue: ({props}) => {
          return {
            torrent: TorrentStore.getTorrent(props.options.hash),
          };
        },
      },
    ];
  },
);

export default ConnectedTorrentDetailsModal;
