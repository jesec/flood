import React from 'react';

import TorrentDetails from './TorrentDetails';
import TorrentList from './TorrentList';

export default class TorrentListContainer extends React.Component {
  render() {
    return (
      <div className="torrents">
        <TorrentList />
        <TorrentDetails />
      </div>
    );
  }

}
