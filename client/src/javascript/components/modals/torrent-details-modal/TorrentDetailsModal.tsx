import {FC} from 'react';
import {useLingui} from '@lingui/react';
import {useMedia} from 'react-use';

import Modal from '../Modal';
import TorrentMediainfo from './TorrentMediainfo';
import TorrentContents from './TorrentContents';
import TorrentGeneralInfo from './TorrentGeneralInfo';
import TorrentHeading from './TorrentHeading';
import TorrentPeers from './TorrentPeers';
import TorrentTrackers from './TorrentTrackers';

const TorrentDetailsModal: FC = () => {
  const {i18n} = useLingui();
  const isSmallScreen = useMedia('(max-width: 720px)');

  const tabs = {
    'torrent-details': {
      content: TorrentGeneralInfo,
      label: i18n._('torrents.details.details'),
    },
    'torrent-contents': {
      content: TorrentContents,
      label: i18n._('torrents.details.files'),
      modalContentClasses: 'modal__content--nested-scroll',
    },
    'torrent-peers': {
      content: TorrentPeers,
      label: i18n._('torrents.details.peers'),
    },
    'torrent-trackers': {
      content: TorrentTrackers,
      label: i18n._('torrents.details.trackers'),
    },
    'torrent-mediainfo': {
      content: TorrentMediainfo,
      label: i18n._('torrents.details.mediainfo'),
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
