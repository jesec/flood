import {formatMessage, FormattedDate, FormattedMessage, FormattedNumber, FormattedTime, injectIntl} from 'react-intl';
import classNames from 'classnames';
import React from 'react';

import Size from '../../General/Size';

class TorrentGeneralInfo extends React.Component {
  getTags(tags) {
    return tags.map((tag, index) => {
      return (
        <span className="tag" key={index}>{tag}</span>
      );
    });
  }

  render() {
    let torrent = this.props.torrent;

    let added = null;
    if (torrent.added) {
      added = new Date(torrent.added * 1000);
    }

    let creation = null;
    if (torrent.creationDate) {
      creation = new Date(torrent.creationDate * 1000);
    }

    const VALUE_NOT_AVAILABLE = (
      <span className="not-available">
        <FormattedMessage id="torrents.details.general.none"
          defaultMessage="None" />
      </span>
    );

    return (
      <div className="torrent-details__section torrent-details__section--general">
        <table className="torrent-details__table table">
          <tbody>
            <tr className="torrent-details__table__heading">
              <td className="torrent-details__table__heading--tertiary" colSpan="2">
                <FormattedMessage
                  id="torrents.details.general.heading.general"
                  defaultMessage="General"
                />
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--added">
              <td className="torrent-details__detail__label">
                <FormattedMessage
                  id="torrents.details.general.added"
                  defaultMessage="Added"
                />
              </td>
              <td className="torrent-details__detail__value">
                {added
                  ? this.props.intl.formatDate(added, {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit'}) + ' ' +
                    this.props.intl.formatTime(added)
                  : VALUE_NOT_AVAILABLE}
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--free-disk-space">
              <td className="torrent-details__detail__label">
                <FormattedMessage
                  id="torrents.details.general.free.disk.space"
                  defaultMessage="Free Disk Space"
                />
              </td>
              <td className="torrent-details__detail__value">
                <Size value={torrent.freeDiskSpace} />
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--location">
              <td className="torrent-details__detail__label">
                <FormattedMessage
                  id="torrents.details.general.location"
                  defaultMessage="Location"
                />
              </td>
              <td className="torrent-details__detail__value">
                {torrent.basePath}
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--scheduler">
              <td className="torrent-details__detail__label">
                <FormattedMessage
                  id="torrents.details.general.scheduler"
                  defaultMessage="Scheduler"
                />
              </td>
              <td className="torrent-details__detail__value">
                {torrent.ignoreScheduler === '1'
                  ? this.props.intl.formatMessage({
                    id: 'torrents.details.general.scheduler.ignored',
                    defaultMessage: 'Ignored'})
                  : this.props.intl.formatMessage({
                    id: 'torrents.details.general.scheduler.obeyed',
                    defaultMessage: 'Obeyed'})}
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--tags">
              <td className="torrent-details__detail__label">
                <FormattedMessage
                  id="torrents.details.general.tags"
                  defaultMessage="Tags"
                />
              </td>
              <td className="torrent-details__detail__value">
                {(torrent.tags.length
                  ? this.getTags(torrent.tags)
                  : VALUE_NOT_AVAILABLE)}
              </td>
            </tr>
            <tr className="torrent-details__table__heading">
              <td className="torrent-details__table__heading--tertiary" colSpan="2">
                <FormattedMessage
                  id="torrents.details.general.heading.transfer"
                  defaultMessage="Transfer"
                />
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--downloaded">
              <td className="torrent-details__detail__label">
                <FormattedMessage
                  id="torrents.details.general.downloaded"
                  defaultMessage="Downloaded"
                />
              </td>
              <td className="torrent-details__detail__value">
                <FormattedNumber value={torrent.percentComplete} />
                <em className="unit">%</em>
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--peers">
              <td className="torrent-details__detail__label">
                <FormattedMessage
                  id="torrents.details.general.peers"
                  defaultMessage="Peers"
                />
              </td>
              <td className="torrent-details__detail__value">
                <FormattedMessage
                  id="torrents.details.general.connected"
                  defaultMessage="{connected} connected of {total}"
                  values={{
                    connectedCount: torrent.connectedPeers,
                    connected: <FormattedNumber value={torrent.connectedPeers} />,
                    total: <FormattedNumber value={torrent.totalPeers} />
                  }}
                />
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--seeds">
              <td className="torrent-details__detail__label">
                <FormattedMessage
                  id="torrents.details.general.seeds"
                  defaultMessage="Seeds"
                />
              </td>
              <td className="torrent-details__detail__value">
                <FormattedMessage
                  id="torrents.details.general.connected"
                  defaultMessage="{connected} connected of {total}"
                  values={{
                    connectedCount: torrent.connectedSeeds,
                    connected: <FormattedNumber value={torrent.connectedSeeds} />,
                    total: <FormattedNumber value={torrent.totalSeeds} />
                  }}
                />
              </td>
            </tr>
            <tr className="torrent-details__table__heading">
              <td className="torrent-details__table__heading--tertiary" colSpan="2">
                <FormattedMessage
                  id="torrents.details.general.heading.torrent"
                  defaultMessage="Torrent"
                />
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--comment">
              <td className="torrent-details__detail__label">
                <FormattedMessage
                  id="torrents.details.general.comment"
                  defaultMessage="Comment"
                />
              </td>
              <td className="torrent-details__detail__value">
                {(torrent.comment.substr(10)
                  ? torrent.comment.substr(10)
                  : VALUE_NOT_AVAILABLE)}
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--created">
              <td className="torrent-details__detail__label">
                <FormattedMessage
                  id="torrents.details.general.creation.date"
                  defaultMessage="Creation Date"
                />
              </td>
              <td className="torrent-details__detail__value">
                {creation
                  ? this.props.intl.formatDate(creation, {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit'}) + ' ' +
                    this.props.intl.formatTime(creation)
                  : VALUE_NOT_AVAILABLE}
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--hash">
              <td className="torrent-details__detail__label">
                <FormattedMessage
                  id="torrents.details.general.hash"
                  defaultMessage="Hash"
                />
              </td>
              <td className="torrent-details__detail__value">
                {torrent.hash}
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--size">
              <td className="torrent-details__detail__label">
                <FormattedMessage
                  id="torrents.details.general.size"
                  defaultMessage="Size"
                />
              </td>
              <td className="torrent-details__detail__value">
                <Size value={torrent.sizeBytes} />
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--type">
              <td className="torrent-details__detail__label">
                <FormattedMessage
                  id="torrents.details.general.type"
                  defaultMessage="Type"
                />
              </td>
              <td className="torrent-details__detail__value">
                {torrent.isPrivate === '0'
                  ? this.props.intl.formatMessage({
                    id: 'torrents.details.general.type.public',
                    defaultMessage: 'Public'})
                  : this.props.intl.formatMessage({
                    id: 'torrents.details.general.type.private',
                    defaultMessage: 'Private'})}
              </td>
            </tr>
            <tr className="torrent-details__table__heading">
              <td className="torrent-details__table__heading--tertiary" colSpan="2">
                <FormattedMessage
                  id="torrents.details.general.heading.tracker"
                  defaultMessage="Tracker"
                />
              </td>
            </tr>
            <tr className="torrent-details__detail torrent-details__detail--tracker-message">
              <td className="torrent-details__detail__label">
                <FormattedMessage
                  id="torrents.details.general.tracker.message"
                  defaultMessage="Tracker Message"
                />
              </td>
              <td className="torrent-details__detail__value">
                {(torrent.message ? torrent.message : VALUE_NOT_AVAILABLE)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default injectIntl(TorrentGeneralInfo);
