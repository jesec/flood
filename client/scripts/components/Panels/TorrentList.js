import React from 'react';

import ActionBar from '../TorrentList/ActionBar';
import ApplicationPanel from '../Layout/ApplicationPanel';
import TorrentList from '../TorrentList';

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
