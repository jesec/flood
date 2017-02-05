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
import TorrentDetail from './TorrentDetail';
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
  'handleDoubleClick',
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

class Torrent extends React.Component {
  constructor(props) {
    super();

    this.state = {
      isSelected: props.selected
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillUpdate(nextProps) {
    if (nextProps.selected !== this.props.selected) {
      this.setState({isSelected: nextProps.selected});
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.selected !== this.props.selected
      || nextState.isSelected !== this.state.isSelected
      || nextProps.isCondensed !== this.props.isCondensed) {
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
      shouldUpdate = TORRENT_PRIMITIVES_TO_OBSERVE.some((key) => {
        return nextTorrent[key] !== torrent[key];
      });
    }

    if (!shouldUpdate) {
      return Object.keys(nextProps.propWidths).some((key) => {
        return nextProps.propWidths[key] !== this.props.propWidths[key];
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

  getWidth(slug) {
    const {defaultWidth, defaultPropWidths, propWidths} = this.props;

    return propWidths[slug] || defaultPropWidths[slug] || defaultWidth;
  }

  handleClick(event) {
    this.setState({isSelected: true});
    this.props.handleClick(this.props.torrent.hash, event);
  }

  handleDoubleClick(event) {
    this.props.handleDoubleClick(this.props.torrent, event);
  }

  handleRightClick(event) {
    if (!this.state.isSelected) {
      this.handleClick(event);
    }

    this.props.handleRightClick(this.props.torrent, event);
  }

  render() {
    const {isSelected} = this.state;
    const {isCondensed, torrent} = this.props;
    const torrentClasses = torrentStatusClasses(
      torrent,
      {
        'torrent--is-selected': isSelected,
        'torrent--is-condensed': isCondensed,
        'torrent--is-expanded': !isCondensed
      },
      'torrent'
    );

    if (isCondensed) {
      return (
        <li className={torrentClasses} onClick={this.handleClick}
          onContextMenu={this.handleRightClick}
          onDoubleClick={this.handleDoubleClick}>
          <TorrentDetail className="table__cell"
            slug="name"
            value={torrent.name}
            width={this.getWidth('name')} />
          <TorrentDetail className="table__cell"
            slug="progress-bar"
            value={(
              <ProgressBar percent={torrent.percentComplete}
                icon={torrentStatusIcons(torrent.status)} />
            )}
            width={this.getWidth('percentComplete')} />
          <TorrentDetail className="table__cell"
            slug="downloadTotal"
            value={torrent.bytesDone}
            width={this.getWidth('downloadTotal')} />
          <TorrentDetail className="table__cell"
            slug="downloadRate"
            value={torrent.downloadRate}
            width={this.getWidth('downloadRate')} />
          <TorrentDetail className="table__cell"
            slug="uploadTotal"
            value={torrent.uploadTotal}
            width={this.getWidth('uploadTotal')} />
          <TorrentDetail className="table__cell"
            slug="uploadRate"
            value={torrent.uploadRate}
            width={this.getWidth('uploadRate')} />
          <TorrentDetail className="table__cell"
            slug="eta"
            value={torrent.eta}
            width={this.getWidth('eta')} />
          <TorrentDetail className="table__cell"
            slug="ratio"
            value={torrent.ratio}
            width={this.getWidth('ratio')} />
          <TorrentDetail className="table__cell"
            slug="sizeBytes"
            value={torrent.sizeBytes}
            width={this.getWidth('sizeBytes')} />
          <TorrentDetail className="table__cell"
            slug="peers"
            secondaryValue={torrent.connectedPeers}
            value={torrent.totalPeers}
            width={this.getWidth('peers')} />
          <TorrentDetail className="table__cell"
            slug="seeds"
            secondaryValue={torrent.connectedSeeds}
            value={torrent.totalSeeds}
            width={this.getWidth('seeds')} />
          <TorrentDetail className="table__cell"
            slug="added"
            value={torrent.added}
            width={this.getWidth('added')} />
        </li>
      );
    }

    return (
      <li className={torrentClasses} onClick={this.handleClick}
        onContextMenu={this.handleRightClick}
        onDoubleClick={this.handleDoubleClick}>
        <div className="torrent__details__section__wrapper">
          <TorrentDetail
            className="torrent__details__section torrent__details__section--primary"
            slug="name"
            value={torrent.name} />
          <div className="torrent__details__section torrent__details__section--secondary">
            <TorrentDetail icon slug="eta" value={torrent.eta} />
            <TorrentDetail icon
              slug="downloadRate"
              value={torrent.downloadRate} />
            <TorrentDetail icon slug="uploadRate" value={torrent.uploadRate} />
          </div>
        </div>
        <div className="torrent__details__section torrent__details__section--tertiary">
          <TorrentDetail icon
            slug="completed"
            secondaryValue={torrent.bytesDone}
            value={torrent.percentComplete} />
          <TorrentDetail icon slug="uploadTotal" value={torrent.uploadTotal} />
          <TorrentDetail icon slug="ratio" value={torrent.ratio} />
          <TorrentDetail icon slug="sizeBytes" value={torrent.sizeBytes} />
          <TorrentDetail icon slug="ratio" value={torrent.ratio} />
          <TorrentDetail icon
            slug="peers"
            secondaryValue={torrent.connectedPeers}
            value={torrent.totalPeers} />
          <TorrentDetail icon
            slug="seeds"
            secondaryValue={torrent.connectedSeeds}
            value={torrent.totalSeeds} />
          <TorrentDetail icon slug="added" value={torrent.added} />
          <TorrentDetail icon slug="tags" value={torrent.tags} />
        </div>
        <div className="torrent__details__section torrent__details__section--quaternary">
          <ProgressBar percent={torrent.percentComplete}
            icon={torrentStatusIcons(torrent.status)} />
        </div>
        <button className="torrent__more-info floating-action__button"
          onClick={this.props.handleDetailsClick.bind(this, torrent)}
          tabIndex="-1">
          {ICONS.information}
        </button>
      </li>
    );
  }
}

Torrent.defaultProps = {
  isCondensed: false
};

export default Torrent;
