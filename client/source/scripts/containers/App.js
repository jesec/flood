import {connect} from 'react-redux';
import React from 'react';

import ActionBar from '../containers/ActionBar';
import Modals from '../components/modals/Modals';
import Sidebar from './Sidebar';
import rootSelector from '../selectors/rootSelector';
import TorrentList from '../containers/TorrentList';
import TorrentListHeader from '../components/torrent-list/TorrentListHeader';

export default class FloodApp extends React.Component {

  render() {
    return (
      <div className="flood">
        <Sidebar />
        <main className="content">
          <ActionBar />
          <TorrentList />
        </main>
        <Modals />
      </div>
    );
  }

}
