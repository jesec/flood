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
import type {TorrentPeerListColumn} from "@shared/types/TorrentPeer";

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

  const sortPeerByProperty = (event, property: TorrentPeerListColumn) => {
    const {sortPeers: sortBy} = SettingStore.floodSettings;
    const nextDirection: 'desc' | 'asc' = sortBy.direction === 'asc' ? 'desc': 'asc';
    const newSortBy = {
      direction: nextDirection,
      property
    };
    SettingActions.saveSetting('sortPeers', newSortBy);

    const clickedColumn = event.target

    // clean classes linked to the sorting on every 'th'
    clickedColumn.parentElement.querySelectorAll('th').forEach(th => {
        th.classList.remove('table__heading', 'table__heading--is-sorted', 'table__heading--direction--asc', 'table__heading--direction--desc');
    });

    // then show the sorting arrow on the selected column
    clickedColumn.classList.add('table__heading', 'table__heading--is-sorted', `table__heading--direction--${nextDirection}`);

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
        <thead className="table__row torrent-details__table__heading">
          <tr css={{
              cursor: 'pointer',
          }}
          >
            <th className="torrent-details__table__heading--primary table__heading--no-border"
                onClick={(event) => sortPeerByProperty(event, 'address')}
            >
              <Trans id="torrents.details.peers" />
              <Badge>{peers.length}</Badge>
            </th>
            <th className="torrent-details__table__heading--primary table__heading--no-border"
                onClick={(event) => sortPeerByProperty(event, 'downloadRate')}
            >DL</th>
            <th className="torrent-details__table__heading--primary table__heading--no-border"
                onClick={(event) => sortPeerByProperty(event, 'uploadRate')}
            >UL</th>
            <th className="torrent-details__table__heading--primary table__heading--no-border"
                onClick={(event) => sortPeerByProperty(event, 'completedPercent')}
            >%</th>
            <th className="torrent-details__table__heading--primary table__heading--no-border"
                onClick={(event) => sortPeerByProperty(event, 'clientVersion')}
            >Client</th>
            <th className="torrent-details__table__heading--primary table__heading--no-border"
                onClick={(event) => sortPeerByProperty(event, 'isEncrypted')}
            >Enc</th>
            <th className="torrent-details__table__heading--primary table__heading--no-border"
                onClick={(event) => sortPeerByProperty(event, 'isIncoming')}
            >In</th>
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
