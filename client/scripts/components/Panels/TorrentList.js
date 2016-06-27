import React from 'react';

import ActionBar from '../torrent-list/ActionBar';
import ApplicationPanel from '../layout/ApplicationPanel';
import TorrentListContainer from '../torrent-list/TorrentListContainer';

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
