import React from 'react';
import ReactDOM from 'react-dom';

import ApplicationView from '../components/layout/ApplicationView';
import ApplicationContent from '../components/layout/ApplicationContent';
import Modals from '../components/modals/Modals';
import Notifications from '../components/notifications/Notifications';
import Sidebar from '../components/panels/Sidebar';
import SettingsStore from '../stores/SettingsStore';
import TorrentActions from '../actions/TorrentActions';
import TorrentList from '../components/panels/TorrentList';

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
          <TorrentList />
          <Modals />
          <Notifications />
        </ApplicationContent>
      </ApplicationView>
    );
  }
}
