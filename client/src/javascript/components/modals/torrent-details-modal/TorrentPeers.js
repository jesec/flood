import {FormattedMessage} from 'react-intl';
import React from 'react';

import Badge from '../../general/Badge';
import Size from '../../general/Size';
import Checkmark from '../../icons/Checkmark';

const checkmark = <Checkmark />;

export default class TorrentPeers extends React.Component {
  constructor() {
    super();

    this.state = {
      erroredCountryImages: [],
    };
  }

  flagImageAsErrored(countryCode) {
    const {erroredCountryImages} = this.state;
    erroredCountryImages.push(countryCode);
    this.setState({erroredCountryImages});
  }

  getImageErrorHandlerFn(countryCode) {
    return () => this.flagImageAsErrored(countryCode);
  }

  render() {
    const {peers} = this.props;

    if (peers) {
      const {erroredCountryImages} = this.state;
      const peerList = peers.map(peer => {
        const {country: countryCode} = peer;
        const encryptedIcon = peer.isEncrypted ? checkmark : null;
        let peerCountry = null;

        if (countryCode) {
          let image = null;

          if (!erroredCountryImages.includes(countryCode)) {
            let flagImageSrc;
            try {
              // We can ignore the lint warnings becuase we need all of the flags available for request.
              // eslint-disable-next-line global-require,no-undef,import/no-dynamic-require
              flagImageSrc = require(`../../../../images/flags/${countryCode.toLowerCase()}.png`);
            } catch (err) {
              this.flagImageAsErrored(countryCode);
              flagImageSrc = null;
            }

            if (flagImageSrc) {
              image = (
                <img
                  alt={countryCode}
                  className="peers-list__flag__image"
                  onError={this.getImageErrorHandlerFn(countryCode)}
                  src={flagImageSrc}
                />
              );
            }
          }

          peerCountry = (
            <span className="peers-list__flag">
              {image}
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
