import React from 'react';

import ActionBar from '../torrent-list/ActionBar';
import ApplicationPanel from '../layout/ApplicationPanel';
import TorrentList from '../torrent-list';

class TorrentListPanel extends React.Component {
  render() {
    return (
      <ApplicationPanel modifier="torrent-list" className="view--torrent-list">
        <ActionBar />
        <TorrentList />
      </ApplicationPanel>
    );
  }
}

TorrentListPanel.propTypes = {
  children: React.PropTypes.node
};

export default TorrentListPanel;
