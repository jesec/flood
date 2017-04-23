import React from 'react';
import ReactDOM from 'react-dom';

import Alerts from '../alerts/Alerts';
import ApplicationView from '../layout/ApplicationView';
import ApplicationContent from '../layout/ApplicationContent';
import Modals from '../modals/Modals';
import Sidebar from '../panels/Sidebar';
import SettingsStore from '../../stores/SettingsStore';
import TorrentActions from '../../actions/TorrentActions';
import TorrentList from '../panels/TorrentList';

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
