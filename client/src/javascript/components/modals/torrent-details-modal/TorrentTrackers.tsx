import {FC, useCallback, useEffect, useState} from 'react';
import {Trans} from '@lingui/react';

import {Checkbox} from '@client/ui';

import type {TorrentTracker} from '@shared/types/TorrentTracker';

import Badge from '../../general/Badge';
import TorrentActions from '../../../actions/TorrentActions';
import UIStore from '../../../stores/UIStore';

const TorrentTrackers: FC = () => {
  const [trackers, setTrackers] = useState<Array<TorrentTracker>>([]);

  const trackerCount = trackers.length;
  const trackerTypes = ['http', 'udp', 'dht'];
  // Clients that cannot enable or disable trackers do not report their state.
  const canToggleTrackers = trackers.some((tracker) => tracker.isEnabled != null);

  const fetchTrackers = useCallback(() => {
    if (UIStore.activeModal?.id === 'torrent-details') {
      return TorrentActions.fetchTorrentTrackers(UIStore.activeModal.hash).then((data) => {
        if (data != null) {
          setTrackers(data);
        }
      });
    }

    return Promise.resolve();
  }, []);

  const trackerDetails = trackers.map((tracker, index) => (
    // The same URL may be listed more than once, so the index is the only stable identity.
    <tr key={index}>
      <td className="torrent-details__trackers--url">{tracker.url}</td>
      <td>{trackerTypes[tracker.type - 1]}</td>
      {canToggleTrackers && (
        <td>
          <Checkbox
            id={`tracker-enabled-${index}`}
            checked={tracker.isEnabled === true}
            onClick={() => {
              if (UIStore.activeModal?.id === 'torrent-details') {
                TorrentActions.setTrackerEnabled(UIStore.activeModal.hash, {
                  indices: [index],
                  isEnabled: tracker.isEnabled !== true,
                }).then(fetchTrackers);
              }
            }}
          />
        </td>
      )}
    </tr>
  ));

  useEffect(() => {
    fetchTrackers();
  }, [fetchTrackers]);

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
            {canToggleTrackers && (
              <th className="torrent-details__table__heading--secondary">
                <Trans id="torrents.details.trackers.enabled" />
              </th>
            )}
          </tr>
        </thead>
        <tbody>{trackerDetails}</tbody>
      </table>
    </div>
  );
};

export default TorrentTrackers;
