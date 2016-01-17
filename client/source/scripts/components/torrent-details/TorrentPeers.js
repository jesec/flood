import React from 'react';

import FolderOpenSolid from '../icons/FolderOpenSolid';
import DirectoryTree from '../filesystem/DirectoryTree';
import File from '../icons/File';
import format from '../../util/formatData';

export default class TorrentPeers extends React.Component {
  getPeerList(peers) {
    if (peers) {
      let peerList = null;
      let peerCount = 0;

      peerList = peers.map(function(peer, index) {
        let downloadRate = format.data(peer.downloadRate, '/s');
        let uploadRate = format.data(peer.uploadRate, '/s');
        return (
          <tr key={index}>
            <td>{peer.address}</td>
            <td>
              {downloadRate.value}
              <em className="unit">{downloadRate.unit}</em>
            </td>
            <td>
              {uploadRate.value}
              <em className="unit">{uploadRate.unit}</em>
            </td>
          </tr>
        );
      });
      peerCount = peerList.length;

      return (
        <div className="torrent-details__peers torrent-details__section">
          <table className="torrent-details__table table">
            <thead className="torrent-details__table__heading">
              <tr>
                <th>
                  Peers
                  <span className="torrent-details__table__heading__count">
                    {peerCount}
                  </span>
                </th>
                <th>DL</th>
                <th>UL</th>
              </tr>
            </thead>
            <tbody>
              {peerList}
            </tbody>
          </table>
        </div>
      )
    } else {
      return <strong>'no peers'</strong>;
    }
  }

  render() {
    return this.getPeerList(this.props.peers);
  }
}
