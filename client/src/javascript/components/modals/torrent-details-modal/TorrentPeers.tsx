import {FC, Suspense, useEffect, useState} from 'react';
import {Trans} from '@lingui/react';
import {useInterval} from 'react-use';

import {CheckmarkThick, CountryFlag, Lock, Spinner} from '@client/ui/icons';
import ConfigStore from '@client/stores/ConfigStore';
import TorrentActions from '@client/actions/TorrentActions';
import UIStore from '@client/stores/UIStore';
import SettingStore from "@client/stores/SettingStore";
import SettingActions from "@client/actions/SettingActions";

import type {TorrentPeer} from '@shared/types/TorrentPeer';

import Badge from '../../general/Badge';
import Size from '../../general/Size';
import sortPeers from "@client/util/sortPeers";

const TorrentPeers: FC = () => {
  const [peers, setPeers] = useState<Array<TorrentPeer>>([]);
  const [pollingDelay, setPollingDelay] = useState<number | null>(null);

  const fetchPeers = () => {

    const {sortPeers: sortBy} = SettingStore.floodSettings;

    setPollingDelay(null);
    if (UIStore.activeModal?.id === 'torrent-details') {
      TorrentActions.fetchTorrentPeers(UIStore.activeModal?.hash).then((data) => {
        if (data != null) {
          const sortedData = sortPeers(data, sortBy);
          setPeers(sortedData);
        }
      });
    }
    setPollingDelay(ConfigStore.pollInterval);
  };

  const sortPeerByProperty = (property: string) => {
    const {sortPeers: sortBy} = SettingStore.floodSettings;
    const nextDirection: 'desc' | 'asc' = sortBy.direction === 'asc' ? 'desc': 'asc';
    const newSortBy = {
      direction: nextDirection,
      property
    };
    SettingActions.saveSetting('sortPeers', newSortBy);
    fetchPeers();
  }

  useEffect(() => fetchPeers(), []);
  useInterval(() => fetchPeers(), pollingDelay);

  return (
    <div className="torrent-details__section torrent-details__section--peers">
      <table
        className="torrent-details__table table"
        css={{
          td: {
            maxWidth: '140px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }}
      >
        <thead className="torrent-details__table__heading">
          <tr>
            <th className="torrent-details__table__heading--primary"
                onClick={() => {
                  sortPeerByProperty('address');
                }}>
              <Trans id="torrents.details.peers" />
              <Badge>{peers.length}</Badge>
            </th>
            <th className="torrent-details__table__heading--secondary"
                onClick={() => {
                  sortPeerByProperty('downloadRate');
                }}>DL</th>
            <th className="torrent-details__table__heading--secondary">UL</th>
            <th className="torrent-details__table__heading--secondary">%</th>
            <th className="torrent-details__table__heading--secondary">Client</th>
            <th className="torrent-details__table__heading--secondary">Enc</th>
            <th className="torrent-details__table__heading--secondary">In</th>
          </tr>
        </thead>
        <tbody>
          {peers.map((peer) => {
            const {country: countryCode} = peer;
            const encryptedIcon = peer.isEncrypted ? <Lock /> : null;
            const incomingIcon = peer.isIncoming ? <CheckmarkThick /> : null;

            return (
              <tr key={peer.address}>
                <td>
                  <span className="peers-list__flag">
                    <Suspense fallback={<Spinner />}>
                      <CountryFlag countryCode={countryCode} />
                    </Suspense>
                    <span className="peers-list__flag__text">{countryCode}</span>
                  </span>
                  {peer.address}
                </td>
                <td>
                  <Size value={peer.downloadRate} isSpeed />
                </td>
                <td>
                  <Size value={peer.uploadRate} isSpeed />
                </td>
                <td>{`${Math.ceil(peer.completedPercent)}%`}</td>
                <td>{peer.clientVersion}</td>
                <td className="peers-list__encryption">{encryptedIcon}</td>
                <td className="peers-list__incoming">{incomingIcon}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TorrentPeers;
