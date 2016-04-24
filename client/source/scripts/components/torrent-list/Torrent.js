import classNames from 'classnames';
import React from 'react';

import CalendarIcon from '../icons/CalendarIcon';
import ClockIcon from '../icons/ClockIcon';
import DiskIcon from '../icons/DiskIcon';
import DotsMini from '../icons/DotsMini';
import DownloadThickIcon from '../icons/DownloadThickIcon';
import EventTypes from '../../constants/EventTypes';
import format from '../../util/formatData';
import PeersIcon from '../icons/PeersIcon';
import ProgressBar from '../ui/ProgressBar';
import RatioIcon from '../icons/RatioIcon';
import SeedsIcon from '../icons/SeedsIcon';
import {torrentStatusIcons} from '../../util/torrentStatusIcons';
import {torrentStatusClasses} from '../../util/torrentStatusClasses';
import UploadThickIcon from '../icons/UploadThickIcon';

const METHODS_TO_BIND = [
  'handleClick',
  'handleRightClick'
];

export default class Torrent extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleClick(event) {
    this.props.handleClick(this.props.torrent.hash, event);
  }

  handleRightClick(event) {
    if (!this.props.selected) {
      this.handleClick(event);
    }
    this.props.handleRightClick(this.props.torrent, event);
  }

  render() {
    let torrent = this.props.torrent;

    let added = new Date(torrent.added * 1000);
    let addedString = (added.getMonth() + 1) + '/' + added.getDate() + '/' +
      added.getFullYear();
    let completed = format.data(torrent.bytesDone);
    let downloadRate = format.data(torrent.downloadRate, '/s');
    let downloadTotal = format.data(torrent.downloadTotal);
    let eta = format.eta(torrent.eta);
    let ratio = format.ratio(torrent.ratio);
    let secondaryDetails = [];
    let totalSize = format.data(torrent.sizeBytes);
    let uploadRate = format.data(torrent.uploadRate, '/s');
    let uploadTotal = format.data(torrent.uploadTotal);

    let torrentClasses = torrentStatusClasses(torrent, this.props.selected ? 'is-selected' : null, 'torrent');
    let torrentStatusIcon = torrentStatusIcons(torrent.status);

    let isActivelyDownloading = downloadRate.value > 0 || uploadRate.value > 0;
    let wasAddedRecently = (Date.now() - added.getTime()) < 1000 * 60 * 10; // Was added in the last 10 minutes.

    if (isActivelyDownloading) {
      secondaryDetails.push(
        <li className="torrent__details--secondary torrent__details--eta"
          key="eta">
          <span className="torrent__details__icon"><ClockIcon /></span>
          {eta}
        </li>
      );
    }

    if (isActivelyDownloading || wasAddedRecently) {
      secondaryDetails.push(
        <li className="torrent__details--secondary torrent__details--speed
          torrent__details--speed--download" key="download-rate">
          <span className="torrent__details__icon"><DownloadThickIcon /></span>
          {downloadRate.value}
          <em className="unit">{downloadRate.unit}</em>
        </li>,
        <li className="torrent__details--secondary torrent__details--speed
          torrent__details--speed--upload" key="upload-rate">
          <span className="torrent__details__icon"><UploadThickIcon /></span>
          {uploadRate.value}
          <em className="unit">{uploadRate.unit}</em>
        </li>
      );
    }

    return (
      <li className={torrentClasses} onClick={this.handleClick}
        onContextMenu={this.handleRightClick}>
        <ul className="torrent__details">
          <li className="torrent__details--primary text-overflow">
            {torrent.name}
          </li>
          {secondaryDetails}
        </ul>
        <ul className="torrent__details torrent__details--tertiary">
          <li className="torrent__details--completed">
            <span className="torrent__details__icon"><DownloadThickIcon /></span>
            {torrent.percentComplete}
            <em className="unit">%</em>
            &nbsp;&mdash;&nbsp;
            {completed.value}
            <em className="unit">{completed.unit}</em>
          </li>
          <li className="torrent__details--uploaded">
            <span className="torrent__details__icon"><UploadThickIcon /></span>
            {uploadTotal.value}
            <em className="unit">{uploadTotal.unit}</em>
          </li>
          <li className="torrent__details--ratio">
            <span className="torrent__details__icon"><RatioIcon /></span>
            {ratio}
          </li>
          <li className="torrent__details--size">
            <span className="torrent__details__icon"><DiskIcon /></span>
            {totalSize.value}
            <em className="unit">{totalSize.unit}</em>
          </li>
          <li className="torrent__details--added">
            <span className="torrent__details__icon"><CalendarIcon /></span>
            {addedString}
          </li>
          <li className="torrent__details--peers">
            <span className="torrent__details__icon"><PeersIcon /></span>
            {torrent.connectedPeers} <em className="unit">of</em> {torrent.totalPeers}
          </li>
          <li className="torrent__details--seeds">
            <span className="torrent__details__icon"><SeedsIcon /></span>
            {torrent.connectedSeeds} <em className="unit">of</em> {torrent.totalSeeds}
          </li>
        </ul>
        <ProgressBar percent={torrent.percentComplete} icon={torrentStatusIcon} />
        <button className="torrent__more-info floating-action__button"
          onClick={this.props.handleDetailsClick.bind(this, torrent)}>
          <DotsMini size="mini" />
        </button>
      </li>
    );
  }
}
