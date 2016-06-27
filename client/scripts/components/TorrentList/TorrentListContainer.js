import React from 'react';

import TorrentList from './TorrentList';

export default class TorrentListContainer extends React.Component {
  render() {
    return (
      <div className="torrents">
        <TorrentList />
      </div>
    );
  }

}
