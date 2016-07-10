import {formatMessage, FormattedDate, FormattedMessage, FormattedTime, injectIntl} from 'react-intl';
import classNames from 'classnames';
import React from 'react';

import format from '../../../util/formatData';

class TorrentGeneralInfo extends React.Component {
  getTags(tags) {
    return tags.map((tag, index) => {
      return (
        <span>{tag}</span>
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
      <ul className="torrent-details__section">
        <li className="torrent-details__section__heading">
          General
        </li>
        <li className="torrent-details__detail  torrent-details__detail--size">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.added"
            defaultMessage="Added"
          /></span>
          <FormattedDate
            value={added}
            year="numeric"
            month="long"
            day="2-digit"
          /> <FormattedTime
            value={added} />
        </li>
        <li className="torrent-details__detail  torrent-details__detail--seeds">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.location"
            defaultMessage="Location"
          /></span>
          {torrent.basePath}
        </li>
        <li className="torrent-details__detail  torrent-details__detail--seeds">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.scheduler"
            defaultMessage="Scheduler"
          /></span>
          {torrent.ignoreScheduler === '1' ? this.props.intl.formatMessage({
            id: 'torrents.details.general.scheduler.ignored',
            defaultMessage: 'Ignored'
          }) : this.props.intl.formatMessage({
            id: 'torrents.details.general.scheduler.obeyed',
            defaultMessage: 'Obeyed'
          })}
        </li>
        <li className="torrent-details__detail  torrent-details__detail--seeds">
          <span className="torrent-details__detail__label">Tags</span>
          {this.getTags(torrent.tags)}
        </li>
        <li className="torrent-details__section__heading">
          Transfer
        </li>
        <li className="torrent-details__detail  torrent-details__detail--completed">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.downloaded"
            defaultMessage="Downloaded"
          /></span>
          {torrent.percentComplete}
          <em className="unit">%</em>
        </li>
        <li className="torrent-details__detail  torrent-details__detail--peers">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.peers"
            defaultMessage="Peers"
          /></span>
          {torrent.connectedPeers} of {torrent.totalPeers} connected
        </li>
        <li className="torrent-details__detail  torrent-details__detail--seeds">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.seeds"
            defaultMessage="Seeds"
          /></span>
          {torrent.connectedSeeds} of {torrent.totalSeeds} connected
        </li>
        <li className="torrent-details__section__heading">
          Torrent
        </li>
        <li className="torrent-details__detail  torrent-details__detail--seeds">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.comment"
            defaultMessage="Comment"
          /></span>
          {torrent.comment.substr(10)}
        </li>
        <li className="torrent-details__detail  torrent-details__detail--seeds">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.creation.date"
            defaultMessage="Creation Date"
          /></span>
          <FormattedDate
            value={creation}
            year="numeric"
            month="long"
            day="2-digit"
          /> <FormattedTime
            value={creation} />
        </li>
        <li className="torrent-details__detail  torrent-details__detail--seeds">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.hash"
            defaultMessage="Hash"
          /></span>
          {torrent.hash}
        </li>
        <li className="torrent-details__detail  torrent-details__detail--size">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.size"
            defaultMessage="Size"
          /></span>
          {totalSize.value}
          <em className="unit">{totalSize.unit}</em>
        </li>
        <li className="torrent-details__detail  torrent-details__detail--seeds">
          <span className="torrent-details__detail__label"><FormattedMessage
            id="torrents.details.general.type"
            defaultMessage="Type"
          /></span>
          {torrent.isPrivate === '0' ? this.props.intl.formatMessage({
            id: 'torrents.details.general.type.public',
            defaultMessage: 'Public'
          }) : this.props.intl.formatMessage({
            id: 'torrents.details.general.type.private',
            defaultMessage: 'Private'
          })}
        </li>
      </ul>
    );
  }
}

export default injectIntl(TorrentGeneralInfo);
