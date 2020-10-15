import {FormattedMessage} from 'react-intl';
import React from 'react';

import type {TorrentTracker} from '@shared/types/TorrentTracker';

import Badge from '../../general/Badge';

interface TorrentTrackersProps {
  trackers: Array<TorrentTracker>;
}

const TorrentTrackers: React.FC<TorrentTrackersProps> = ({trackers}: TorrentTrackersProps) => {
  const trackerCount = trackers.length;
  const trackerTypes = ['http', 'udp', 'dht'];

  const trackerDetails = trackers.map((tracker) => (
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
                <FormattedMessage id="torrents.details.trackers" />
                <Badge>{trackerCount}</Badge>
              </th>
              <th className="torrent-details__table__heading--secondary">
                <FormattedMessage id="torrents.details.trackers.type" />
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
      <FormattedMessage id="torrents.details.trackers.no.data" />
    </span>
  );
};

export default TorrentTrackers;
