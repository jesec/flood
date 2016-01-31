import React from 'react';
import ReactDOM from 'react-dom';

import Application from './components/layout/Application';
import ApplicationContent from './components/layout/ApplicationContent';
import Modals from './components/modals/Modals';
import Sidebar from './components/panels/Sidebar';
import TorrentListView from './components/panels/TorrentListView';
import TorrentDetailsView from './components/panels/TorrentDetailsView';
import TorrentActions from './actions/TorrentActions';

class FloodApp extends React.Component {
  componentDidMount() {
    TorrentActions.fetchLatestTorrentLocation();
  }

  render() {
    return (
      <Application>
        <Sidebar />
        <ApplicationContent>
          <TorrentDetailsView />
          <TorrentListView />
        </ApplicationContent>
        <Modals />
      </Application>
    );
  }
}


ReactDOM.render(<FloodApp />, document.getElementById('app'));
