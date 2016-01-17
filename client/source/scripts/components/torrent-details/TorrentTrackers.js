import React from 'react';

import FolderOpenSolid from '../icons/FolderOpenSolid';
import DirectoryTree from '../filesystem/DirectoryTree';
import File from '../icons/File';

export default class TorrentTrackrs extends React.Component {
  getTrackerList(trackers = []) {
    let trackerCount = trackers.length;
    let trackerTypes = ['http', 'udp', 'dht'];

    let trackerDetails = trackers.map((tracker, index) => {
      return (
        <tr key={index}>
          <td>
            {tracker.url}
          </td>
          <td>
            {trackerTypes[tracker.type - 1]}
          </td>
        </tr>
      );
    });

    return (
      <div className="torrent-details__peers torrent-details__section">
        <table className="torrent-details__table table">
          <thead className="torrent-details__table__heading">
            <tr>
              <th>
                Trackers
                <span className="torrent-details__table__heading__count">
                  {trackerCount}
                </span>
              </th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {trackerDetails}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    return this.getTrackerList(this.props.trackers);
  }
}
