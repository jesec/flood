import {FC, lazy, useEffect} from 'react';
import {observer} from 'mobx-react';
import classnames from 'classnames';

import ActionBar from '@client/components/torrent-list/ActionBar';
import ApplicationContent from '@client/components/layout/ApplicationContent';
import ApplicationView from '@client/components/layout/ApplicationView';
import ConfigStore from '@client/stores/ConfigStore';
import FloodActions from '@client/actions/FloodActions';
import SettingStore from '@client/stores/SettingStore';
import Sidebar from '@client/components/sidebar/Sidebar';
import TorrentDetailsPanel from '@client/components/torrent-details-panel/TorrentDetailsPanel';
import TorrentDetailsPanelResizeHandle from '@client/components/torrent-details-panel/TorrentDetailsPanelResizeHandle';
import TorrentList from '@client/components/torrent-list/TorrentList';
import UIStore from '@client/stores/UIStore';

// Load OverlayScrollbars CSS into the third-party layer
import '@client/util/loadOverlayScrollbars';

const Alerts = lazy(() => import('@client/components/alerts/Alerts'));
const Modals = lazy(() => import('@client/components/modals/Modals'));

const Overview: FC = observer(() => {
  useEffect(() => {
    FloodActions.startActivityStream();
  }, []);

  const usePanelView = SettingStore.floodSettings.UITorrentDetailsPanel ?? true;
  const showPanel = UIStore.detailsPanelVisible && !ConfigStore.isSmallScreen && usePanelView;
  const panelHeight = SettingStore.floodSettings.detailsPanelHeight || 400;

  return (
    <ApplicationView>
      <Sidebar />
      <ApplicationContent>
        <div
          className={classnames('application__panel application__panel--torrent-list', 'view--torrent-list', {
            'has-details-panel': showPanel,
          })}
          style={
            {
              '--details-panel-height': `${panelHeight}px`,
            } as React.CSSProperties
          }
        >
          <div className="torrent-list-section">
            <ActionBar />
            <TorrentList />
          </div>

          {showPanel && (
            <>
              <TorrentDetailsPanelResizeHandle />
              <TorrentDetailsPanel />
            </>
          )}
        </div>
        <Modals />
        <Alerts />
      </ApplicationContent>
    </ApplicationView>
  );
});

export default Overview;
