import {FC, useEffect, useState} from 'react';
import {observer} from 'mobx-react';
import {Trans, useLingui} from '@lingui/react';

import ConfigStore from '@client/stores/ConfigStore';
import TorrentStore from '@client/stores/TorrentStore';
import UIStore from '@client/stores/UIStore';
import SettingStore from '@client/stores/SettingStore';

import TorrentMediainfo from '../modals/torrent-details-modal/TorrentMediainfo';
import TorrentContents from '../modals/torrent-details-modal/TorrentContents';
import TorrentGeneralInfo from '../modals/torrent-details-modal/TorrentGeneralInfo';
import TorrentHeading from '../modals/torrent-details-modal/TorrentHeading';
import TorrentPeers from '../modals/torrent-details-modal/TorrentPeers';
import TorrentTrackers from '../modals/torrent-details-modal/TorrentTrackers';

const TorrentDetailsPanel: FC = observer(() => {
  const {i18n} = useLingui();
  const [activeTab, setActiveTab] = useState<string>('torrent-details');

  const torrentHash = UIStore.detailsPanelHash;
  const torrent = torrentHash ? TorrentStore.torrents[torrentHash] : undefined;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        UIStore.setDetailsPanelVisible(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const tabs = [
    {
      id: 'torrent-details',
      label: i18n._('torrents.details.details'),
      content: TorrentGeneralInfo,
    },
    {
      id: 'torrent-contents',
      label: i18n._('torrents.details.files'),
      content: TorrentContents,
    },
    {
      id: 'torrent-peers',
      label: i18n._('torrents.details.peers'),
      content: TorrentPeers,
    },
    {
      id: 'torrent-trackers',
      label: i18n._('torrents.details.trackers'),
      content: TorrentTrackers,
    },
    {
      id: 'torrent-mediainfo',
      label: i18n._('torrents.details.mediainfo'),
      content: TorrentMediainfo,
    },
  ];

  const height = SettingStore.floodSettings.detailsPanelHeight || 400;

  if (!torrentHash) {
    return (
      <div className="torrent-details-panel" style={{height: `${height}px`}}>
        <div className="torrent-details-panel__empty-state">
          <Trans id="torrents.details.select.torrent" />
        </div>
      </div>
    );
  }

  if (!torrent) {
    return (
      <div className="torrent-details-panel" style={{height: `${height}px`}}>
        <div className="torrent-details-panel__empty-state">
          <Trans id="torrents.details.torrent.not.found" />
        </div>
      </div>
    );
  }

  const ActiveTabContent = tabs.find((tab) => tab.id === activeTab)?.content || TorrentGeneralInfo;

  return (
    <div className="torrent-details-panel" style={{height: `${height}px`}}>
      <div className="torrent-details-panel__header">
        <TorrentHeading />
        <button
          type="button"
          className="torrent-details-panel__close-button"
          onClick={() => UIStore.setDetailsPanelVisible(false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="torrent-details-panel__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`torrent-details-panel__tab ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="torrent-details-panel__content">
        <ActiveTabContent />
      </div>
    </div>
  );
});

export default TorrentDetailsPanel;
