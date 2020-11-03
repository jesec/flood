import {useIntl} from 'react-intl';
import {useMediaQuery} from '@react-hook/media-query';
import * as React from 'react';

import Modal from '../Modal';
import TorrentMediainfo from './TorrentMediainfo';
import TorrentContents from './TorrentContents';
import TorrentGeneralInfo from './TorrentGeneralInfo';
import TorrentHeading from './TorrentHeading';
import TorrentPeers from './TorrentPeers';
import TorrentTrackers from './TorrentTrackers';

const TorrentDetailsModal: React.FC = () => {
  const intl = useIntl();
  const isSmallScreen = useMediaQuery('(max-width: 720px)');

  const tabs = {
    'torrent-details': {
      content: TorrentGeneralInfo,
      label: intl.formatMessage({
        id: 'torrents.details.details',
      }),
    },
    'torrent-contents': {
      content: TorrentContents,
      label: intl.formatMessage({
        id: 'torrents.details.files',
      }),
      modalContentClasses: 'modal__content--nested-scroll',
    },
    'torrent-peers': {
      content: TorrentPeers,
      label: intl.formatMessage({
        id: 'torrents.details.peers',
      }),
    },
    'torrent-trackers': {
      content: TorrentTrackers,
      label: intl.formatMessage({
        id: 'torrents.details.trackers',
      }),
    },
    'torrent-mediainfo': {
      content: TorrentMediainfo,
      label: intl.formatMessage({
        id: 'torrents.details.mediainfo',
      }),
      modalContentClasses: 'modal__content--nested-scroll',
    },
  };

  return (
    <Modal
      heading={<TorrentHeading key="torrent-heading" />}
      size="large"
      tabs={tabs}
      orientation={isSmallScreen ? 'horizontal' : 'vertical'}
      tabsInBody={!isSmallScreen}
    />
  );
};

export default TorrentDetailsModal;
