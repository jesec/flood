import React from 'react';
import ReactDOM from 'react-dom';

import Alerts from '../components/alerts';
import ApplicationView from '../components/layout/ApplicationView';
import ApplicationContent from '../components/layout/ApplicationContent';
import Modals from '../components/modals';
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
          <Alerts />
        </ApplicationContent>
      </ApplicationView>
    );
  }
}
