import {FC, useEffect, useState} from 'react';
import {Trans} from '@lingui/react';

import type {TorrentTracker} from '@shared/types/TorrentTracker';

import Badge from '../../general/Badge';
import TorrentActions from '../../../actions/TorrentActions';
import UIStore from '../../../stores/UIStore';

const TorrentTrackers: FC = () => {
  const [trackers, setTrackers] = useState<Array<TorrentTracker>>([]);

  const trackerCount = trackers.length;
  const trackerTypes = ['http', 'udp', 'dht'];

  const trackerDetails = trackers.map((tracker) => (
    <tr key={tracker.url}>
      <td className="torrent-details__trackers--url">{tracker.url}</td>
      <td>{trackerTypes[tracker.type - 1]}</td>
    </tr>
  ));

  useEffect(() => {
    if (UIStore.activeModal?.id === 'torrent-details') {
      TorrentActions.fetchTorrentTrackers(UIStore.activeModal?.hash).then((data) => {
        if (data != null) {
          setTrackers(data);
        }
      });
    }
  }, []);

  return (
    <div className="torrent-details__trackers torrent-details__section">
      <table className="torrent-details__table table">
        <thead className="torrent-details__table__heading">
          <tr>
            <th className="torrent-details__table__heading--primary">
              <Trans id="torrents.details.trackers" />
              <Badge>{trackerCount}</Badge>
            </th>
            <th className="torrent-details__table__heading--secondary">
              <Trans id="torrents.details.trackers.type" />
            </th>
          </tr>
        </thead>
        <tbody>{trackerDetails}</tbody>
      </table>
    </div>
  );
};

export default TorrentTrackers;
