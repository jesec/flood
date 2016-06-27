import React from 'react';
import ReactDOM from 'react-dom';

import ApplicationView from '../components/Layout/ApplicationView';
import ApplicationContent from '../components/Layout/ApplicationContent';
import Modals from '../components/Modals';
import Notifications from '../components/Notifications';
import Sidebar from '../components/Panels/Sidebar';
import SettingsStore from '../stores/SettingsStore';
import TorrentActions from '../actions/TorrentActions';
import TorrentList from '../components/Panels/TorrentList';

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
