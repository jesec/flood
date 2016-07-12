import {formatMessage, FormattedDate, FormattedMessage, FormattedTime, injectIntl} from 'react-intl';
import classNames from 'classnames';
import React from 'react';

import format from '../../../util/formatData';

class ValueNotAvailable extends React.Component {
  render() {
    return (
      <span className="torrent-details__detail__value--not-available"><FormattedMessage
        id="torrents.details.general.none"
        defaultMessage="None"
      /></span>
    );
  }
}

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

    let added = new Date(torrent.added * 1000);
    let creation = new Date(torrent.creationDate * 1000);
    let totalSize = format.data(torrent.sizeBytes);
    let freeDiskSpace = format.data(torrent.freeDiskSpace);

    return (
      <ul className="torrent-details__section torrent-details__section--general">
        <li className="torrent-details__section__sub-heading">
          <FormattedMessage
            id="torrents.details.general.heading.general"
            defaultMessage="General"
          />
        </li>
        <li className="torrent-details__detail torrent-details__detail--size">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.added"
            defaultMessage="Added"
          /></span>
          <span className="torrent-details__detail__value">
            <FormattedDate
              value={added}
              year="numeric"
              month="long"
              day="2-digit"
            /> <FormattedTime
              value={added} />
          </span>
        </li>
        <li className="torrent-details__detail torrent-details__detail--location">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.location"
            defaultMessage="Location"
          /></span>
          <span className="torrent-details__detail__value">
            {torrent.basePath}
          </span>
        </li>
        <li className="torrent-details__detail torrent-details__detail--scheduler">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.scheduler"
            defaultMessage="Scheduler"
          /></span>
          <span className="torrent-details__detail__value">
            {torrent.ignoreScheduler === '1' ? this.props.intl.formatMessage({
              id: 'torrents.details.general.scheduler.ignored',
              defaultMessage: 'Ignored'
            }) : this.props.intl.formatMessage({
              id: 'torrents.details.general.scheduler.obeyed',
              defaultMessage: 'Obeyed'
            })}
          </span>
        </li>
        <li className="torrent-details__detail torrent-details__detail--tags">
          <span className="torrent-details__detail__label">Tags</span>
          <span className="torrent-details__detail__value">
            {(torrent.tags.length ? this.getTags(torrent.tags) : <ValueNotAvailable />)}
          </span>
        </li>
        <li className="torrent-details__section__sub-heading">
          <FormattedMessage
            id="torrents.details.general.heading.transfer"
            defaultMessage="Transfer"
          />
        </li>
        <li className="torrent-details__detail torrent-details__detail--completed">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.downloaded"
            defaultMessage="Downloaded"
          /></span>
          <span className="torrent-details__detail__value">
            {torrent.percentComplete}
            <em className="unit">%</em>
          </span>
        </li>
        <li className="torrent-details__detail torrent-details__detail--peers">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.peers"
            defaultMessage="Peers"
          /></span>
          <span className="torrent-details__detail__value">
            {torrent.connectedPeers} of {torrent.totalPeers} <FormattedMessage
            id="torrents.details.general.connected"
            defaultMessage="connected"
          />
          </span>
        </li>
        <li className="torrent-details__detail torrent-details__detail--seeds">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.seeds"
            defaultMessage="Seeds"
          /></span>
          <span className="torrent-details__detail__value">
            {torrent.connectedSeeds} of {torrent.totalSeeds} <FormattedMessage
            id="torrents.details.general.connected"
            defaultMessage="connected"
          />
          </span>
        </li>
        <li className="torrent-details__section__sub-heading">
          <FormattedMessage
            id="torrents.details.general.heading.torrent"
            defaultMessage="Torrent"
          />
        </li>
        <li className="torrent-details__detail torrent-details__detail--comment">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.comment"
            defaultMessage="Comment"
          /></span>
          {(torrent.comment.substr(10) ? torrent.comment.substr(10) : <ValueNotAvailable />)}
        </li>
        <li className="torrent-details__detail torrent-details__detail--created">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.creation.date"
            defaultMessage="Creation Date"
          /></span>
          <span className="torrent-details__detail__value">
            <FormattedDate
              value={creation}
              year="numeric"
              month="long"
              day="2-digit"
            /> <FormattedTime
              value={creation} />
          </span>
        </li>
        <li className="torrent-details__detail torrent-details__detail--hash">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.hash"
            defaultMessage="Hash"
          /></span>
          <span className="torrent-details__detail__value">
            {torrent.hash}
          </span>
        </li>
        <li className="torrent-details__detail torrent-details__detail--size">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.size"
            defaultMessage="Size"
          /></span>
          <span className="torrent-details__detail__value">
            {totalSize.value}
            <em className="unit">{totalSize.unit}</em>
          </span>
        </li>
        <li className="torrent-details__detail torrent-details__detail--type">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.type"
            defaultMessage="Type"
          /></span>
          <span className="torrent-details__detail__value">
            {torrent.isPrivate === '0' ? this.props.intl.formatMessage({
              id: 'torrents.details.general.type.public',
              defaultMessage: 'Public'
            }) : this.props.intl.formatMessage({
              id: 'torrents.details.general.type.private',
              defaultMessage: 'Private'
            })}
          </span>
        </li>
        <li className="torrent-details__section__sub-heading">
          <FormattedMessage
            id="torrents.details.general.heading.tracker"
            defaultMessage="Tracker"
          />
        </li>
        <li className="torrent-details__detail torrent-details__detail--type">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.tracker.message"
            defaultMessage="Type"
          /></span>
          <span className="torrent-details__detail__value">
            {(torrent.message ? torrent.message : <ValueNotAvailable />)}
          </span>
        </li>
      </ul>
    );
  }
}

export default injectIntl(TorrentGeneralInfo);
