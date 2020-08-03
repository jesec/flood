import {FormattedMessage} from 'react-intl';
import React from 'react';

import Badge from '../../general/Badge';
import Size from '../../general/Size';
import Checkmark from '../../icons/Checkmark';

const checkmark = <Checkmark />;

export default class TorrentPeers extends React.Component {
  render() {
    const {peers} = this.props;

    if (peers) {
      const peerList = peers.map((peer) => {
        const {country: countryCode} = peer;
        const encryptedIcon = peer.isEncrypted ? checkmark : null;
        let peerCountry = null;

        if (countryCode) {
          const flagImageSrc = `static/images/flags/${countryCode.toLowerCase()}.png`;
          peerCountry = (
            <span className="peers-list__flag">
              <img
                alt={countryCode}
                className="peers-list__flag__image"
                src={flagImageSrc}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
              <span className="peers-list__flag__text">{countryCode}</span>
            </span>
          );
        }

        return (
          <tr key={peer.address}>
            <td>
              {peerCountry}
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
                  <FormattedMessage id="torrents.details.peers" defaultMessage="Peers" />
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
        <FormattedMessage
          id="torrents.details.peers.no.data"
          defaultMessage="There is no peer data for this torrent."
        />
      </span>
    );
  }
}
