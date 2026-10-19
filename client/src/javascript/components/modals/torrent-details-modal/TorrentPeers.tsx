import classnames from 'classnames';
import {FC, ReactNode, Suspense, useCallback, useEffect, useMemo, useState} from 'react';
import {Trans} from '@lingui/react';
import {useInterval} from 'react-use';

import {css} from '@client/styled-system/css';
import {CheckmarkThick, CountryFlag, Lock, Spinner} from '@client/ui/icons';
import ConfigStore from '@client/stores/ConfigStore';
import TorrentActions from '@client/actions/TorrentActions';
import UIStore from '@client/stores/UIStore';
import sortPeers from '@client/util/sortPeers';
import type {PeerSortBy, PeerSortProperty} from '@client/util/sortPeers';

import type {TorrentPeer} from '@shared/types/TorrentPeer';

import Badge from '../../general/Badge';
import Size from '../../general/Size';

const TorrentPeers: FC = () => {
  const [peers, setPeers] = useState<Array<TorrentPeer>>([]);
  const [sortBy, setSortBy] = useState<PeerSortBy | null>(null);

  const fetchPeers = useCallback(() => {
    if (UIStore.activeModal?.id === 'torrent-details') {
      TorrentActions.fetchTorrentPeers(UIStore.activeModal?.hash).then((data) => {
        if (data != null) {
          setPeers(data);
        }
      });
    }
  }, []);

  useEffect(() => fetchPeers(), [fetchPeers]);
  useInterval(fetchPeers, ConfigStore.pollInterval);

  const sortedPeers = useMemo(() => (sortBy == null ? peers : sortPeers(peers, sortBy)), [peers, sortBy]);

  const handleSort = (property: PeerSortProperty) => {
    setSortBy((current) => {
      if (current?.property === property) {
        return {property, direction: current.direction === 'asc' ? 'desc' : 'asc'};
      }
      return {property, direction: 'desc'};
    });
  };

  const renderHeading = (property: PeerSortProperty, label: ReactNode) => {
    const isSorted = sortBy?.property === property;
    const classes = classnames(
      'torrent-details__table__heading--secondary',
      'torrent-details__table__heading--sortable',
      {
        'torrent-details__table__heading--is-sorted': isSorted,
        [`torrent-details__table__heading--direction--${sortBy?.direction}`]: isSorted,
      },
    );

    return (
      <th aria-sort={isSorted ? (sortBy.direction === 'asc' ? 'ascending' : 'descending') : 'none'} scope="col">
        <button className={classes} type="button" onClick={() => handleSort(property)}>
          {label}
        </button>
      </th>
    );
  };

  return (
    <div className="torrent-details__section torrent-details__section--peers">
      <table
        className={`torrent-details__table table ${css({
          '& td': {
            maxWidth: '140px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        })}`}
      >
        <thead className="torrent-details__table__heading">
          <tr>
            <th className="torrent-details__table__heading--primary">
              <Trans id="torrents.details.peers" />
              <Badge>{peers.length}</Badge>
            </th>
            {renderHeading('downloadRate', 'DL')}
            {renderHeading('uploadRate', 'UL')}
            {renderHeading('completedPercent', '%')}
            <th className="torrent-details__table__heading--secondary">Client</th>
            <th className="torrent-details__table__heading--secondary">Enc</th>
            <th className="torrent-details__table__heading--secondary">In</th>
          </tr>
        </thead>
        <tbody>
          {sortedPeers.map((peer) => {
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
