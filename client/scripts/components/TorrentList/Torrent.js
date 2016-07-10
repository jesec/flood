import classNames from 'classnames';
import React from 'react';

import CalendarIcon from '../Icons/CalendarIcon';
import ClockIcon from '../Icons/ClockIcon';
import DiskIcon from '../Icons/DiskIcon';
import DownloadThickIcon from '../Icons/DownloadThickIcon';
import EventTypes from '../../constants/EventTypes';
import format from '../../util/formatData';
import InformationIcon from '../Icons/InformationIcon';
import PeersIcon from '../Icons/PeersIcon';
import ProgressBar from '../General/ProgressBar';
import RatioIcon from '../Icons/RatioIcon';
import SeedsIcon from '../Icons/SeedsIcon';
import {torrentStatusIcons} from '../../util/torrentStatusIcons';
import {torrentStatusClasses} from '../../util/torrentStatusClasses';
import UploadThickIcon from '../Icons/UploadThickIcon';

const ICONS = {
  clock: <ClockIcon />,
  disk: <DiskIcon />,
  downloadThick: <DownloadThickIcon />,
  information: <InformationIcon />,
  peers: <PeersIcon />,
  ratio: <RatioIcon />,
  seeds: <SeedsIcon />,
  uploadThick: <UploadThickIcon />
};

const METHODS_TO_BIND = [
  'handleClick',
  'handleRightClick'
];

const TORRENT_PRIMITIVES_TO_OBSERVE = [
  'bytesDone',
  'downloadRate',
  'status',
  'tags',
  'totalPeers',
  'totalSeeds',
  'uploadRate'
];

const TORRENT_ARRAYS_TO_OBSERVE = [
  'status',
  'tags'
];

export default class Torrent extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.selected !== this.props.selected) {
      return true;
    }

    let nextTorrent = nextProps.torrent;
    let {torrent} = this.props;

    let shouldUpdate = TORRENT_ARRAYS_TO_OBSERVE.some((key) => {
      let nextArr = nextTorrent[key];
      let currentArr = this.props.torrent[key];

      return nextArr.length !== currentArr.length ||
        nextArr.some((nextValue, index) => {
          return nextValue !== currentArr[index];
        });
    });

    if (!shouldUpdate) {
      return TORRENT_PRIMITIVES_TO_OBSERVE.some((key) => {
        return nextTorrent[key] !== torrent[key];
      });
    }

    return shouldUpdate;
  }

  getTags(tags) {
    return tags.map((tag, index) => {
      return (
        <li className="torrent__tag" key={index}>{tag}</li>
      );
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
    let totalSize = format.data(torrent.sizeBytes);
    let uploadRate = format.data(torrent.uploadRate, '/s');
    let uploadTotal = format.data(torrent.uploadTotal);

    let torrentClasses = torrentStatusClasses(torrent, this.props.selected ? 'is-selected' : null, 'torrent');

    let isActive = downloadRate.value > 0 || uploadRate.value > 0;
    let isDownloading = downloadRate.value > 0;

    let secondaryDetails = [
      <li className="torrent__details--secondary torrent__details--speed
        torrent__details--speed--download" key="download-rate">
        <span className="torrent__details__icon">{ICONS.downloadThick}</span>
        {downloadRate.value}
        <em className="unit">{downloadRate.unit}</em>
      </li>,
      <li className="torrent__details--secondary torrent__details--speed
        torrent__details--speed--upload" key="upload-rate">
        <span className="torrent__details__icon">{ICONS.uploadThick}</span>
        {uploadRate.value}
        <em className="unit">{uploadRate.unit}</em>
      </li>
    ];

    if (isDownloading) {
      secondaryDetails.unshift(
        <li className="torrent__details--secondary torrent__details--eta"
          key="eta">
          <span className="torrent__details__icon">{ICONS.clock}</span>
          {eta}
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
        <div className="torrent__details torrent__details--tertiary">
          <ul className="torrent__details torrent__details--tertiary--stats">
            <li className="torrent__details--completed">
              <span className="torrent__details__icon">{ICONS.downloadThick}</span>
              {torrent.percentComplete}
              <em className="unit">%</em>
              &nbsp;&mdash;&nbsp;
              {completed.value}
              <em className="unit">{completed.unit}</em>
            </li>
            <li className="torrent__details--uploaded">
              <span className="torrent__details__icon">{ICONS.uploadThick}</span>
              {uploadTotal.value}
              <em className="unit">{uploadTotal.unit}</em>
            </li>
            <li className="torrent__details--ratio">
              <span className="torrent__details__icon">{ICONS.ratio}</span>
              {ratio}
            </li>
            <li className="torrent__details--size">
              <span className="torrent__details__icon">{ICONS.disk}</span>
              {totalSize.value}
              <em className="unit">{totalSize.unit}</em>
            </li>
            <li className="torrent__details--added">
              <span className="torrent__details__icon">{ICONS.calendar}</span>
              {addedString}
            </li>
            <li className="torrent__details--peers">
              <span className="torrent__details__icon">{ICONS.peers}</span>
              {torrent.connectedPeers} <em className="unit">of</em> {torrent.totalPeers}
            </li>
            <li className="torrent__details--seeds">
              <span className="torrent__details__icon">{ICONS.seeds}</span>
              {torrent.connectedSeeds} <em className="unit">of</em> {torrent.totalSeeds}
            </li>
          </ul>
          <ul className="torrent__details torrent__details--tertiary--tags torrent__tags">
            {this.getTags(torrent.tags)}
          </ul>
        </div>
        <ProgressBar percent={torrent.percentComplete} icon={torrentStatusIcons(torrent.status)} />
        <button className="torrent__more-info floating-action__button"
          onClick={this.props.handleDetailsClick.bind(this, torrent)}
          tabIndex="-1">
          {ICONS.information}
        </button>
      </li>
    );
  }
}
