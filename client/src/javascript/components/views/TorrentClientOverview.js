import React from 'react';

import ActionBar from '../torrent-list/ActionBar';
import Alerts from '../alerts/Alerts';
import ApplicationContent from '../layout/ApplicationContent';
import ApplicationPanel from '../layout/ApplicationPanel';
import ApplicationView from '../layout/ApplicationView';
import Modals from '../modals/Modals';
import Sidebar from '../sidebar/Sidebar';
import TorrentList from '../torrent-list/TorrentList';

export default class TorrentCLientOverview extends React.Component {
  render() {
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
  }
}
