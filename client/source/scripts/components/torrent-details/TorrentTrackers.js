import React from 'react';

export default class TorrentTrackrs extends React.Component {
  render() {
    let trackers = this.props.trackers || [];

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
      <div className="torrent-details__trackers torrent-details__section">
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
}
