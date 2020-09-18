import {FormattedMessage} from 'react-intl';
import React from 'react';

import Badge from '../../general/Badge';
import Size from '../../general/Size';
import Checkmark from '../../icons/Checkmark';
import SpinnerIcon from '../../icons/SpinnerIcon';

import type {TorrentPeer} from '../../../stores/TorrentStore';

interface TorrentPeersProps {
  peers: Array<TorrentPeer>;
}

const flagsCache: Record<string, string | null> = {};

export default class TorrentPeers extends React.Component<TorrentPeersProps> {
  private static getFlag(countryCode?: string): string | null {
    if (countryCode == null) {
      return null;
    }

    if (flagsCache[countryCode] !== undefined) {
      return flagsCache[countryCode];
    }

    const loadFlag = async () => {
      let flag: string | null = null;
      await import(`../../../../images/flags/${countryCode.toLowerCase()}.png`)
        .then(
          ({default: image}: {default: string}) => {
            flag = image;
          },
          () => {
            flag = null;
          },
        )
        .finally(() => {
          flagsCache[countryCode] = flag;
        });
      return flag;
    };

    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw loadFlag();
  }

  private static CountryFlag({countryCode}: {countryCode?: string}): JSX.Element | null {
    const flag = TorrentPeers.getFlag(countryCode);
    if (flag == null) {
      return null;
    }
    return <img alt={countryCode} className="peers-list__flag__image" src={flag} />;
  }

  render() {
    const {peers} = this.props;

    if (peers) {
      const peerList = peers.map((peer) => {
        const {country: countryCode} = peer;
        const encryptedIcon = peer.isEncrypted ? <Checkmark /> : null;

        return (
          <tr key={peer.address}>
            <td>
              <span className="peers-list__flag">
                <React.Suspense fallback={<SpinnerIcon />}>
                  <TorrentPeers.CountryFlag countryCode={countryCode} />
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
            <td>{peer.completedPercent}%</td>
            <td>{peer.clientVersion}</td>
            <td className="peers-list__encryption">{encryptedIcon}</td>
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
                  <Badge>{peers.length}</Badge>
                </th>
                <th className="torrent-details__table__heading--secondary">DL</th>
                <th className="torrent-details__table__heading--secondary">UL</th>
                <th className="torrent-details__table__heading--secondary">%</th>
                <th className="torrent-details__table__heading--secondary">Client</th>
                <th className="torrent-details__table__heading--secondary">Enc</th>
              </tr>
            </thead>
            <tbody>{peerList}</tbody>
          </table>
        </div>
      );
    }
    return (
      <span className="torrent-details__section__null-data">
        <FormattedMessage id="torrents.details.peers.no.data" />
      </span>
    );
  }
}
