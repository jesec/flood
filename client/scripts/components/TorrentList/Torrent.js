import classNames from 'classnames';
import {FormattedDate, FormattedMessage, FormattedNumber} from 'react-intl';
import React from 'react';

import CalendarIcon from '../Icons/CalendarIcon';
import ClockIcon from '../Icons/ClockIcon';
import DiskIcon from '../Icons/DiskIcon';
import DownloadThickIcon from '../Icons/DownloadThickIcon';
import Duration from '../General/Duration';
import EventTypes from '../../constants/EventTypes';
import InformationIcon from '../Icons/InformationIcon';
import PeersIcon from '../Icons/PeersIcon';
import ProgressBar from '../General/ProgressBar';
import Ratio from '../General/Ratio';
import RatioIcon from '../Icons/RatioIcon';
import SeedsIcon from '../Icons/SeedsIcon';
import Size from '../General/Size';
import {torrentStatusIcons} from '../../util/torrentStatusIcons';
import {torrentStatusClasses} from '../../util/torrentStatusClasses';
import UploadThickIcon from '../Icons/UploadThickIcon';

const ICONS = {
  clock: <ClockIcon />,
  disk: <DiskIcon />,
  downloadThick: <DownloadThickIcon />,
  information: <InformationIcon />,
  calendar: <CalendarIcon />,
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

    let torrentClasses = torrentStatusClasses(torrent, this.props.selected ? 'is-selected' : null, 'torrent');

    let isActive = torrent.downloadRate > 0 || torrent.uploadRate > 0;
    let isDownloading = torrent.downloadRate > 0;

    let secondaryDetails = [
      <li className="torrent__details--secondary torrent__details--speed
        torrent__details--speed--download" key="download-rate">
        <span className="torrent__details__icon">{ICONS.downloadThick}</span>
        <Size value={torrent.downloadRate} isSpeed={true} />
      </li>,
      <li className="torrent__details--secondary torrent__details--speed
        torrent__details--speed--upload" key="upload-rate">
        <span className="torrent__details__icon">{ICONS.uploadThick}</span>
        <Size value={torrent.uploadRate} isSpeed={true} />
      </li>
    ];

    if (isDownloading) {
      secondaryDetails.unshift(
        <li className="torrent__details--secondary torrent__details--eta"
          key="eta">
          <span className="torrent__details__icon">{ICONS.clock}</span>
          <Duration value={torrent.eta} />
        </li>
      );
    }

    let tertiaryDetails = [
      <li className="torrent__details--completed" key="downloaded">
        <span className="torrent__details__icon">{ICONS.downloadThick}</span>
        <FormattedNumber value={torrent.percentComplete} />
        <em className="unit">%</em>
        &nbsp;&mdash;&nbsp;
        <Size value={torrent.bytesDone} />
      </li>,
      <li className="torrent__details--uploaded" key="uploaded">
        <span className="torrent__details__icon">{ICONS.uploadThick}</span>
        <Size value={torrent.uploadTotal} />
      </li>,
      <li className="torrent__details--ratio" key="ratio">
        <span className="torrent__details__icon">{ICONS.ratio}</span>
        <Ratio value={torrent.ratio} />
      </li>,
      <li className="torrent__details--size" key="size">
        <span className="torrent__details__icon">{ICONS.disk}</span>
        <Size value={torrent.sizeBytes} />
      </li>,
      <li className="torrent__details--peers" key="peers">
        <span className="torrent__details__icon">{ICONS.peers}</span>
        <FormattedMessage
          id="torrent.list.peers"
          defaultMessage="{connected} {of} {total}"
          values={{
            connected: <FormattedNumber value={torrent.connectedPeers} />,
            of: <em className="unit"><FormattedMessage id="torrent.list.peers.of" defaultMessage="of" /></em>,
            total: <FormattedNumber value={torrent.totalPeers} />
          }}
        />
      </li>,
      <li className="torrent__details--seeds" key="seeds">
        <span className="torrent__details__icon">{ICONS.seeds}</span>
        <FormattedMessage
          id="torrent.list.peers"
          defaultMessage="{connected} {of} {total}"
          values={{
            connected: <FormattedNumber value={torrent.connectedSeeds} />,
            of: <em className="unit"><FormattedMessage id="torrent.list.peers.of" defaultMessage="of" /></em>,
            total: <FormattedNumber value={torrent.totalSeeds} />
          }}
        />
      </li>
    ];

    if (torrent.added) {
      let added = new Date(torrent.added * 1000);

      tertiaryDetails.push(
        <li className="torrent__details--added" key="added">
          <span className="torrent__details__icon">{ICONS.calendar}</span>
          <FormattedDate value={added} />
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
            {tertiaryDetails}
          </ul>
          <ul className="torrent__details torrent__details--tertiary--tags torrent__tags tag">
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
