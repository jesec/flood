import {FC, Suspense, useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {useInterval} from 'react-use';

import type {TorrentPeer} from '@shared/types/TorrentPeer';

import Badge from '../../general/Badge';
import ConfigStore from '../../../stores/ConfigStore';
import CountryFlagIcon from '../../icons/CountryFlagIcon';
import Size from '../../general/Size';
import Checkmark from '../../icons/Checkmark';
import LockIcon from '../../icons/LockIcon';
import SpinnerIcon from '../../icons/SpinnerIcon';
import TorrentActions from '../../../actions/TorrentActions';
import UIStore from '../../../stores/UIStore';

const TorrentPeers: FC = () => {
  const [peers, setPeers] = useState<Array<TorrentPeer>>([]);
  const [pollingDelay, setPollingDelay] = useState<number | null>(null);

  const fetchPeers = () => {
    setPollingDelay(null);
    if (UIStore.activeModal?.id === 'torrent-details') {
      TorrentActions.fetchTorrentPeers(UIStore.activeModal?.hash).then((data) => {
        if (data != null) {
          setPeers(data);
        }
      });
    }
    setPollingDelay(ConfigStore.pollInterval);
  };

  useEffect(() => fetchPeers(), []);
  useInterval(() => fetchPeers(), pollingDelay);

  return (
    <div className="torrent-details__section torrent-details__section--peers">
      <table className="torrent-details__table table">
        <thead className="torrent-details__table__heading">
          <tr>
            <th className="torrent-details__table__heading--primary">
              <FormattedMessage id="torrents.details.peers" />
              <Badge>{peers.length}</Badge>
            </th>
            <th className="torrent-details__table__heading--secondary">DL</th>
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
            const encryptedIcon = peer.isEncrypted ? <LockIcon /> : null;
            const incomingIcon = peer.isIncoming ? <Checkmark /> : null;

            return (
              <tr key={peer.address}>
                <td>
                  <span className="peers-list__flag">
                    <Suspense fallback={<SpinnerIcon />}>
                      <CountryFlagIcon countryCode={countryCode} />
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
