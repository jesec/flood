import {FormattedMessage} from 'react-intl';
import React from 'react';

import Badge from '../../general/Badge';

export default class TorrentTrackrs extends React.Component {
  render() {
    const trackers = this.props.trackers || [];

    const trackerCount = trackers.length;
    const trackerTypes = ['http', 'udp', 'dht'];

    const trackerDetails = trackers.map(tracker => (
      <tr key={tracker.url}>
        <td>{tracker.url}</td>
        <td>{trackerTypes[tracker.type - 1]}</td>
      </tr>
    ));

    if (trackerCount) {
      return (
        <div className="torrent-details__trackers torrent-details__section">
          <table className="torrent-details__table table">
            <thead className="torrent-details__table__heading">
              <tr>
                <th className="torrent-details__table__heading--primary">
                  <FormattedMessage id="torrents.details.trackers" defaultMessage="Trackers" />
                  <Badge>{trackerCount}</Badge>
                </th>
                <th className="torrent-details__table__heading--secondary">
                  <FormattedMessage id="torrents.details.trackers.type" defaultMessage="Type" />
                </th>
              </tr>
            </thead>
            <tbody>{trackerDetails}</tbody>
          </table>
        </div>
      );
    }
    return (
      <span className="torrent-details__section__null-data">
        <FormattedMessage
          id="torrents.details.trackers.no.data"
          defaultMessage="There is no tracker data for this torrent."
        />
      </span>
    );
  }
}
