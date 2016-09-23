import React from 'react';
import ReactDOM from 'react-dom';

import Alerts from '../components/Alerts';
import ApplicationView from '../components/Layout/ApplicationView';
import ApplicationContent from '../components/Layout/ApplicationContent';
import Modals from '../components/Modals';
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
          <Alerts />
        </ApplicationContent>
      </ApplicationView>
    );
  }
}
