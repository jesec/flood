import {FormattedMessage, FormattedNumber, injectIntl} from 'react-intl';
import React from 'react';

import Size from '../../general/Size';

class TorrentGeneralInfo extends React.Component {
  getTags(tags) {
    return tags.map(tag => (
      <span className="tag" key={tag}>
        {tag}
      </span>
    ));
  }

  render() {
    const {torrent} = this.props;

    let dateAdded = null;
    if (torrent.dateAdded) {
      dateAdded = new Date(torrent.dateAdded * 1000);
    }

    let creation = null;
    if (torrent.creationDate) {
      creation = new Date(torrent.creationDate * 1000);
    }

    const VALUE_NOT_AVAILABLE = (
      <span className="not-available">
        <FormattedMessage id="torrents.details.general.none" defaultMessage="None" />
      </span>
    );

    return (
      <div className="torrent-details__section torrent-details__section--general">
        <table className="torrent-details__table table">
          <tbody>
            <tr className="torrent-details__table__heading">
              <td className="torrent-details__table__heading--tertiary" colSpan="2">
                <FormattedMessage id="torrents.details.general.heading.general" defaultMessage="General" />
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--dateAdded">
              <td className="torrent-details__detail__label">
                <FormattedMessage id="torrents.details.general.date.added" defaultMessage="Added" />
              </td>
              <td className="torrent-details__detail__value">
                {dateAdded
                  ? `${this.props.intl.formatDate(dateAdded, {
                      year: 'numeric',
                      month: 'long',
                      day: '2-digit',
                    })} ${this.props.intl.formatTime(dateAdded)}`
                  : VALUE_NOT_AVAILABLE}
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--location">
              <td className="torrent-details__detail__label">
                <FormattedMessage id="torrents.details.general.location" defaultMessage="Location" />
              </td>
              <td className="torrent-details__detail__value">{torrent.basePath}</td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--scheduler">
              <td className="torrent-details__detail__label">
                <FormattedMessage id="torrents.details.general.scheduler" defaultMessage="Scheduler" />
              </td>
              <td className="torrent-details__detail__value">
                {torrent.ignoreScheduler === '1'
                  ? this.props.intl.formatMessage({
                      id: 'torrents.details.general.scheduler.ignored',
                      defaultMessage: 'Ignored',
                    })
                  : this.props.intl.formatMessage({
                      id: 'torrents.details.general.scheduler.obeyed',
                      defaultMessage: 'Obeyed',
                    })}
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--tags">
              <td className="torrent-details__detail__label">
                <FormattedMessage id="torrents.details.general.tags" defaultMessage="Tags" />
              </td>
              <td className="torrent-details__detail__value">
                {torrent.tags.length ? this.getTags(torrent.tags) : VALUE_NOT_AVAILABLE}
              </td>
            </tr>
            <tr className="torrent-details__table__heading">
              <td className="torrent-details__table__heading--tertiary" colSpan="2">
                <FormattedMessage id="torrents.details.general.heading.transfer" defaultMessage="Transfer" />
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--downloaded">
              <td className="torrent-details__detail__label">
                <FormattedMessage id="torrents.details.general.downloaded" defaultMessage="Downloaded" />
              </td>
              <td className="torrent-details__detail__value">
                <FormattedNumber value={torrent.percentComplete} />
                <em className="unit">%</em>
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--peers">
              <td className="torrent-details__detail__label">
                <FormattedMessage id="torrents.details.general.peers" defaultMessage="Peers" />
              </td>
              <td className="torrent-details__detail__value">
                <FormattedMessage
                  id="torrents.details.general.connected"
                  defaultMessage="{connected} connected of {total}"
                  values={{
                    connectedCount: torrent.peersConnected,
                    connected: <FormattedNumber value={torrent.peersConnected} />,
                    total: <FormattedNumber value={torrent.peersTotal} />,
                  }}
                />
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--seeds">
              <td className="torrent-details__detail__label">
                <FormattedMessage id="torrents.details.general.seeds" defaultMessage="Seeds" />
              </td>
              <td className="torrent-details__detail__value">
                <FormattedMessage
                  id="torrents.details.general.connected"
                  defaultMessage="{connected} connected of {total}"
                  values={{
                    connectedCount: torrent.seedsConnected,
                    connected: <FormattedNumber value={torrent.seedsConnected} />,
                    total: <FormattedNumber value={torrent.seedsTotal} />,
                  }}
                />
              </td>
            </tr>
            <tr className="torrent-details__table__heading">
              <td className="torrent-details__table__heading--tertiary" colSpan="2">
                <FormattedMessage id="torrents.details.general.heading.torrent" defaultMessage="Torrent" />
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--comment">
              <td className="torrent-details__detail__label">
                <FormattedMessage id="torrents.details.general.comment" defaultMessage="Comment" />
              </td>
              <td className="torrent-details__detail__value">{torrent.comment || VALUE_NOT_AVAILABLE}</td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--created">
              <td className="torrent-details__detail__label">
                <FormattedMessage id="torrents.details.general.date.created" defaultMessage="Creation Date" />
              </td>
              <td className="torrent-details__detail__value">
                {creation
                  ? `${this.props.intl.formatDate(creation, {
                      year: 'numeric',
                      month: 'long',
                      day: '2-digit',
                    })} ${this.props.intl.formatTime(creation)}`
                  : VALUE_NOT_AVAILABLE}
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--hash">
              <td className="torrent-details__detail__label">
                <FormattedMessage id="torrents.details.general.hash" defaultMessage="Hash" />
              </td>
              <td className="torrent-details__detail__value">{torrent.hash}</td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--size">
              <td className="torrent-details__detail__label">
                <FormattedMessage id="torrents.details.general.size" defaultMessage="Size" />
              </td>
              <td className="torrent-details__detail__value">
                <Size value={torrent.sizeBytes} />
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--type">
              <td className="torrent-details__detail__label">
                <FormattedMessage id="torrents.details.general.type" defaultMessage="Type" />
              </td>
              <td className="torrent-details__detail__value">
                {torrent.isPrivate === '0'
                  ? this.props.intl.formatMessage({
                      id: 'torrents.details.general.type.public',
                      defaultMessage: 'Public',
                    })
                  : this.props.intl.formatMessage({
                      id: 'torrents.details.general.type.private',
                      defaultMessage: 'Private',
                    })}
              </td>
            </tr>
            <tr className="torrent-details__table__heading">
              <td className="torrent-details__table__heading--tertiary" colSpan="2">
                <FormattedMessage id="torrents.details.general.heading.tracker" defaultMessage="Tracker" />
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--tracker-message">
              <td className="torrent-details__detail__label">
                <FormattedMessage id="torrents.details.general.tracker.message" defaultMessage="Tracker Message" />
              </td>
              <td className="torrent-details__detail__value">
                {torrent.message ? torrent.message : VALUE_NOT_AVAILABLE}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default injectIntl(TorrentGeneralInfo);
