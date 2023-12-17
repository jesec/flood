import {FC, lazy, useEffect} from 'react';

import ActionBar from '@client/components/torrent-list/ActionBar';
import ApplicationContent from '@client/components/layout/ApplicationContent';
import ApplicationPanel from '@client/components/layout/ApplicationPanel';
import ApplicationView from '@client/components/layout/ApplicationView';
import FloodActions from '@client/actions/FloodActions';
import Sidebar from '@client/components/sidebar/Sidebar';
import TorrentList from '@client/components/torrent-list/TorrentList';

import 'overlayscrollbars/overlayscrollbars.css';

const Alerts = lazy(() => import('@client/components/alerts/Alerts'));
const Modals = lazy(() => import('@client/components/modals/Modals'));

const Overview: FC = () => {
  useEffect(() => {
    FloodActions.startActivityStream();
  }, []);

  return (
    <ApplicationView>
      <Sidebar />
      <ApplicationContent>
        <ApplicationPanel modifier="torrent-list" className="view--torrent-list">
          <ActionBar />
          <TorrentList />
        </ApplicationPanel>
        <Modals />
        <Alerts />
      </ApplicationContent>
    </ApplicationView>
  );
};

export default Overview;
