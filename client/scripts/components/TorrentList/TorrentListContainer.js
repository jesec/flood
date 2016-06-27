import React from 'react';

import TorrentList from './index';

export default class TorrentListContainer extends React.Component {
  render() {
    return (
      <div className="torrents">
        <TorrentList />
      </div>
    );
  }

}
