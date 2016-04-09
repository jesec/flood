import classnames from 'classnames';
import React from 'react';

import ClockIcon from '../icons/ClockIcon';
import DownloadThickIcon from '../icons/DownloadThickIcon';
import format from '../../util/formatData';
import PauseIcon from '../../components/icons/PauseIcon';
import PriorityMeter from '../filesystem/PriorityMeter';
import ProgressBar from '../ui/ProgressBar';
import propsMap from '../../../../../shared/constants/propsMap';
import RatioIcon from '../../components/icons/RatioIcon';
import StartIcon from '../../components/icons/StartIcon';
import StopIcon from '../../components/icons/StopIcon';
import stringUtil from '../../../../../shared/util/stringUtil';
import TorrentActions from '../../actions/TorrentActions';
import {torrentStatusClasses} from '../../util/torrentStatusClasses';
import {torrentStatusIcons} from '../../util/torrentStatusIcons';
import UploadThickIcon from '../icons/UploadThickIcon';

const METHODS_TO_BIND = [
  'getCurrentStatus',
  'handlePause',
  'handleStart',
  'handleStop'
];

export default class TorrentHeading extends React.Component {
  constructor() {
    super();

    this.state = {
      optimisticData: {currentStatus: null}
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.optimisticData.currentStatus) {
      this.setState({optimisticData: {currentStatus: null}});
    }
  }

  getCurrentStatus(torrentStatus) {
    if (torrentStatus.indexOf(propsMap.clientStatus.paused) > -1) {
      return 'pause';
    } else if (torrentStatus.indexOf(propsMap.clientStatus.stopped) > -1) {
      return 'stop';
    } else {
      return 'start';
    }
  }

  getTorrentActions(torrent) {
    let currentStatus = this.state.optimisticData.currentStatus
      || this.getCurrentStatus(torrent.status);
    let statusIcons = {
      'pause': <PauseIcon />,
      'start': <StartIcon />,
      'stop': <StopIcon />
    };
    let torrentActions = ['start', 'pause', 'stop'];
    let torrentActionElements = [
      <li className="torrent-details__sub-heading__tertiary"
        key={torrentActions.length + 1}>
        <PriorityMeter id={torrent.hash} level={torrent.priority} maxLevel={3}
          priorityType="torrent" onChange={this.handlePriorityChange}
          showLabel={true} />
      </li>
    ];

    torrentActions.forEach((torrentAction, index) => {
      let capitalizedAction = stringUtil.capitalize(torrentAction);
      let classes = classnames('torrent-details__sub-heading__tertiary',
        'torrent-details__action', {
          'is-active': torrentAction === currentStatus
        });

      torrentActionElements.push(
        <li className={classes} key={index}
          onClick={this[`handle${capitalizedAction}`]}>
          {statusIcons[torrentAction]}
          {capitalizedAction}
        </li>
      );
    });

    return torrentActionElements;
  }

  handlePause() {
    this.setState({optimisticData: {currentStatus: 'pause'}});
    TorrentActions.pauseTorrents([this.props.torrent.hash]);
  }

  handlePriorityChange(hash, level) {
    TorrentActions.setPriority(hash, level);
  }

  handleStart() {
    this.setState({optimisticData: {currentStatus: 'start'}});
    TorrentActions.startTorrents([this.props.torrent.hash]);
  }

  handleStop() {
    this.setState({optimisticData: {currentStatus: 'stop'}});
    TorrentActions.stopTorrents([this.props.torrent.hash]);
  }

  render() {
    let torrent = this.props.torrent;
    let completed = format.data(torrent.bytesDone);
    let downloadRate = format.data(torrent.downloadRate, '/s');
    let downloadTotal = format.data(torrent.downloadTotal);
    let eta = format.eta(torrent.eta);
    let ratio = format.ratio(torrent.ratio);
    let uploadRate = format.data(torrent.uploadRate, '/s');
    let uploadTotal = format.data(torrent.uploadTotal);

    let torrentClasses = torrentStatusClasses(torrent, 'torrent-details__header');
    let torrentStatusIcon = torrentStatusIcons(torrent.status);

    return (
      <div className={torrentClasses}>
        <h1 className="torrent-details__heading torrent-details--name">{torrent.name}</h1>
        <div className="torrent-details__sub-heading">
          <ul className="torrent-details__sub-heading__secondary">
            <li className="torrent-details__sub-heading__tertiary torrent-details__sub-heading__tertiary--download">
              <DownloadThickIcon />
              {downloadRate.value}
              <em className="unit">{downloadRate.unit}</em>
                &nbsp;&mdash;&nbsp;
                {completed.value}
                <em className="unit">{completed.unit}</em>
            </li>
            <li className="torrent-details__sub-heading__tertiary torrent-details__sub-heading__tertiary--upload">
              <UploadThickIcon />
              {uploadRate.value}
              <em className="unit">{uploadRate.unit}</em>
              &nbsp;&mdash;&nbsp;
              {uploadTotal.value}
              <em className="unit">{uploadTotal.unit}</em>
            </li>
            <li className="torrent-details__sub-heading__tertiary">
              <RatioIcon />
              {ratio}
            </li>
            <li className="torrent-details__sub-heading__tertiary">
              <ClockIcon />
              {eta}
            </li>
          </ul>
          <ul className="torrent-details__sub-heading__secondary">
            {this.getTorrentActions(torrent)}
          </ul>
        </div>
        <ProgressBar percent={torrent.percentComplete} icon={torrentStatusIcon} />
      </div>
    );
  }
}
