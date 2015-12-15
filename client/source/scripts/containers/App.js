import React from 'react';

import ActionBar from '../components/action-bar/ActionBar';
import Modals from '../components/modals/Modals';
import Sidebar from '../components/sidebar/Sidebar';
import TorrentListContainer from '../components/torrent-list/TorrentListContainer';

export default class FloodApp extends React.Component {
  render() {
    return (
      <div className="flood">
        <Sidebar />
        <main className="content">
          <ActionBar />
          <TorrentListContainer />
        </main>
        <Modals />
      </div>
    );
  }
}
