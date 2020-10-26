import {FormattedMessage} from 'react-intl';
import {observable, runInAction} from 'mobx';
import {observer} from 'mobx-react';
import React from 'react';

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

@observer
class TorrentPeers extends React.Component<unknown> {
  peers = observable.array<TorrentPeer>([]);
  polling = setInterval(() => this.fetchPeers(), ConfigStore.pollInterval);

  constructor(props: unknown) {
    super(props);

    this.fetchPeers();
  }

  componentWillUnmount() {
    clearInterval(this.polling);
  }

  fetchPeers = () => {
    if (UIStore.activeModal?.id === 'torrent-details') {
      TorrentActions.fetchTorrentPeers(UIStore.activeModal?.hash).then((peers) => {
        if (peers != null) {
          runInAction(() => {
            this.peers.replace(peers);
          });
        }
      });
    }
  };

  render() {
    const peerList = this.peers.map((peer) => {
      const {country: countryCode} = peer;
      const encryptedIcon = peer.isEncrypted ? <LockIcon /> : null;
      const incomingIcon = peer.isIncoming ? <Checkmark /> : null;

      return (
        <tr key={peer.address}>
          <td>
            <span className="peers-list__flag">
              <React.Suspense fallback={<SpinnerIcon />}>
                <CountryFlagIcon countryCode={countryCode} />
              </React.Suspense>
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
          <td>{`${peer.completedPercent}%`}</td>
          <td>{peer.clientVersion}</td>
          <td className="peers-list__encryption">{encryptedIcon}</td>
          <td className="peers-list__incoming">{incomingIcon}</td>
        </tr>
      );
    });

    return (
      <div className="torrent-details__section torrent-details__section--peers">
        <table className="torrent-details__table table">
          <thead className="torrent-details__table__heading">
            <tr>
              <th className="torrent-details__table__heading--primary">
                <FormattedMessage id="torrents.details.peers" />
                <Badge>{this.peers.length}</Badge>
              </th>
              <th className="torrent-details__table__heading--secondary">DL</th>
              <th className="torrent-details__table__heading--secondary">UL</th>
              <th className="torrent-details__table__heading--secondary">%</th>
              <th className="torrent-details__table__heading--secondary">Client</th>
              <th className="torrent-details__table__heading--secondary">Enc</th>
              <th className="torrent-details__table__heading--secondary">In</th>
            </tr>
          </thead>
          <tbody>{peerList}</tbody>
        </table>
      </div>
    );
  }
}

export default TorrentPeers;
