import React from 'react';

import Badge from '../../General/Badge';
import DirectoryTree from '../../General/Filesystem/DirectoryTree';
import File from '../../Icons/File';
import FolderOpenSolid from '../../Icons/FolderOpenSolid';
import format from '../../../util/formatData';

export default class TorrentPeers extends React.Component {
  render() {
    let peers = this.props.peers;

    if (peers) {
      let peerList = peers.map((peer, index) => {
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

      return (
        <div className="torrent-details__peers torrent-details__section">
          <table className="torrent-details__table table">
            <thead className="torrent-details__table__heading">
              <tr>
                <th className="torrent-details__table__heading--primary">
                  Peers
                  <Badge>
                    {peers.length}
                  </Badge>
                </th>
                <th className="torrent-details__table__heading--secondary">
                  DL
                </th>
                <th className="torrent-details__table__heading--secondary">
                  UL
                </th>
              </tr>
            </thead>
            <tbody>
              {peerList}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <span className="torrent-details__section__null-data">
          There is no peer data for this torrent.
        </span>
      );
    }
  }
}
