import {FormattedMessage} from 'react-intl';
import React from 'react';

import Badge from '../../general/Badge';
import Size from '../../general/Size';
import LockIcon from '../../icons/LockIcon';
import UnlockIcon from '../../icons/UnlockIcon';

export default class TorrentPeers extends React.Component {
  constructor() {
    super();

    this.state = {
      erroredCountryImages: []
    };
  }

  getImageErrorHandlerFn(countryCode) {
    return () => {
      let {erroredCountryImages} = this.state;
      erroredCountryImages.push(countryCode);
      this.setState({erroredCountryImages});
    };
  }

  render() {
    let {peers} = this.props;

    if (peers) {
      let {erroredCountryImages} = this.state;
      let peerList = peers.map((peer, index) => {
        let countryCode = peer.country;
        let isEncrypted = peer.isEncrypted === 1 ? <LockIcon /> : <UnlockIcon />;
        let peerCountry = null;

        if (countryCode) {
          let image = null;

          if (!erroredCountryImages.includes(countryCode)) {
            const flagImageSrc = require(`../../../../images/flags/${countryCode.toLowerCase()}.png`);

            image = (
              <img
                alt={countryCode}
                className="peers-list__flag__image"
                onError={this.getImageErrorHandlerFn(countryCode)}
                src={flagImageSrc} />
            );
          }

          peerCountry = (
            <span className="peers-list__flag">
              {image}
              <span className="peers-list__flag__text">
                {countryCode}
              </span>
            </span>
          );
        }

        return (
          <tr key={index}>
            <td>
              {peerCountry}
              {peer.address}
            </td>
            <td>
              <Size value={peer.downloadRate} isSpeed={true} />
            </td>
            <td>
              <Size value={peer.uploadRate} isSpeed={true} />
            </td>
            <td>
              {peer.completedPercent}%
            </td>
            <td>
              {peer.clientVersion}
            </td>
            <td>
              <span className="peers-list__encryption">
                {isEncrypted}
              </span>
            </td>
          </tr>
        );
      });

      return (
        <div className="torrent-details__section torrent-details__section--peers">
          <table className="torrent-details__table table">
            <thead className="torrent-details__table__heading">
              <tr>
                <th className="torrent-details__table__heading--primary">
                  <FormattedMessage
                    id="torrents.details.peers"
                    defaultMessage="Peers"
                  />
                  <Badge>
                    {peers.length}
                  </Badge>
                </th>
                <th className="torrent-details__table__heading--secondary">
                  DL
                </th>
                <th className="torrent-details__table__heading--secondary">
                  UL
                </th>
                <th className="torrent-details__table__heading--secondary">
                  %
                </th>
                <th className="torrent-details__table__heading--secondary">
                  Client
                </th>
                <th className="torrent-details__table__heading--secondary">
                  ENC
                </th>
              </tr>
            </thead>
            <tbody>
              {peerList}
            </tbody>
          </table>
        </div>
      );
    } else {
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
}
