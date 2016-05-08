import classNames from 'classnames';
import React from 'react';

import format from '../../util/formatData';

export default class TorrentGeneralInfo extends React.Component {
  render() {
    let torrent = this.props.torrent;

    let added = new Date(torrent.added * 1000);
    let addedString = `${added.getHours() + 1}:${added.getMinutes() + 1}:${added.getSeconds() + 1}, ${added.getMonth() + 1}/${added.getDate()}/` +
      `${added.getFullYear()}`;
    let creation = new Date(torrent.creationDate * 1000);
    let creationString = `${creation.getHours() + 1}:${creation.getMinutes() + 1}:${creation.getSeconds() + 1}, ${creation.getMonth() + 1}/${creation.getDate()}/` +
      `${creation.getFullYear()}`;
    let totalSize = format.data(torrent.sizeBytes);
    let freeDiskSpace = format.data(torrent.freeDiskSpace);

    return (
      <ul className="torrent-details__section">
        <li className="torrent-details__detail--size">
          <span className="torrent-details__detail__label">Size</span>
          {totalSize.value}
          <em className="unit">{totalSize.unit}</em>
        </li>
        <li className="torrent-details__detail--completed">
          <span className="torrent-details__detail__label">Downloaded</span>
          {torrent.percentComplete}
          <em className="unit">%</em>
        </li>
        <li className="torrent-details__detail--added">
          <span className="torrent-details__detail__label">Added</span>
          {addedString}
        </li>
        <li className="torrent-details__detail--peers">
          <span className="torrent-details__detail__label">Peers</span>
          {torrent.connectedPeers} of {torrent.totalPeers}
        </li>
        <li className="torrent-details__detail--seeds">
          <span className="torrent-details__detail__label">Seeds</span>
          {torrent.connectedSeeds} of {torrent.totalSeeds}
        </li>
        <li className="torrent-details__detail--seeds">
          <span className="torrent-details__detail__label">Hash</span>
          {torrent.hash}
        </li>
        <li className="torrent-details__detail--seeds">
          <span className="torrent-details__detail__label">Tracker Message</span>
          {torrent.message}
        </li>
        <li className="torrent-details__detail--seeds">
          <span className="torrent-details__detail__label">Creation Date</span>
          {creationString}
        </li>
        <li className="torrent-details__detail--seeds">
          <span className="torrent-details__detail__label">Location</span>
          {torrent.basePath}
        </li>
        <li className="torrent-details__detail--seeds">
          <span className="torrent-details__detail__label">Scheduler</span>
          {torrent.ignoreScheduler === '1' ? 'Ignored' : 'Obeyed'}
        </li>
        <li className="torrent-details__detail--seeds">
          <span className="torrent-details__detail__label">Comment</span>
          {torrent.comment.substr(10)}
        </li>
        <li className="torrent-details__detail--seeds">
          <span className="torrent-details__detail__label">Type</span>
          {torrent.isPrivate === '0' ? 'Public' : 'Private'}
        </li>
        <li className="torrent-details__detail--seeds">
          <span className="torrent-details__detail__label">Free Disk Space</span>
          {freeDiskSpace.value}
          <em className="unit">{freeDiskSpace.unit}</em>
        </li>
      </ul>
    );
  }
}
