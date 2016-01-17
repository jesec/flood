import React from 'react';
import ReactDOM from 'react-dom';

import Application from './components/layout/Application';
import ApplicationContent from './components/layout/ApplicationContent';
import ApplicationPanel from './components/layout/ApplicationPanel';
import Modals from './components/modals/Modals';
import Sidebar from './components/panels/Sidebar';
import TorrentListView from './components/panels/TorrentListView';
import TorrentDetailsView from './components/panels/TorrentDetailsView';

class FloodApp extends React.Component {
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
