import React from 'react';
import ReactDOM from 'react-dom';

import ActionBar from '../torrent-list/ActionBar';
import Alerts from '../alerts/Alerts';
import ApplicationContent from '../layout/ApplicationContent';
import ApplicationPanel from '../layout/ApplicationPanel';
import ApplicationView from '../layout/ApplicationView';
import Modals from '../modals/Modals';
import SettingsStore from '../../stores/SettingsStore';
import Sidebar from '../sidebar/Sidebar';
import TorrentActions from '../../actions/TorrentActions';
import TorrentList from '../torrent-list/TorrentList';

export default class TorrentListView extends React.Component {
  componentDidMount() {
    SettingsStore.fetchClientSettings();
    SettingsStore.fetchFloodSettings();
  }

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
