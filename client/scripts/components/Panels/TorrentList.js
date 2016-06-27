import React from 'react';

import ActionBar from '../TorrentList/ActionBar';
import ApplicationPanel from '../Layout/ApplicationPanel';
import TorrentListContainer from '../TorrentList/TorrentListContainer';

class TorrentList extends React.Component {
  render() {
    return (
      <ApplicationPanel modifier="torrent-list" className="view--torrent-list">
        <ActionBar />
        <TorrentListContainer />
      </ApplicationPanel>
    );
  }
}

TorrentList.propTypes = {
  children: React.PropTypes.node
};

export default TorrentList;
