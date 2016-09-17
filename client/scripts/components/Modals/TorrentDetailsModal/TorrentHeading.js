import {FormattedMessage, FormattedNumber} from 'react-intl';
import classnames from 'classnames';
import React from 'react';

import ClockIcon from '../../Icons/ClockIcon';
import DownloadThickIcon from '../../Icons/DownloadThickIcon';
import Duration from '../../General/Duration';
import PauseIcon from '../../Icons/PauseIcon';
import PriorityMeter from '../../General/Filesystem/PriorityMeter';
import ProgressBar from '../../General/ProgressBar';
import propsMap from '../../../../../shared/constants/propsMap';
import Ratio from '../../General/Ratio';
import RatioIcon from '../../Icons/RatioIcon';
import Size from '../../General/Size';
import StartIcon from '../../Icons/StartIcon';
import StopIcon from '../../Icons/StopIcon';
import stringUtil from '../../../../../shared/util/stringUtil';
import TorrentActions from '../../../actions/TorrentActions';
import {torrentStatusClasses} from '../../../util/torrentStatusClasses';
import {torrentStatusIcons} from '../../../util/torrentStatusIcons';
import UploadThickIcon from '../../Icons/UploadThickIcon';

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
          <FormattedMessage
            id={`torrents.details.actions.${torrentAction}`}
            defaultMessage={capitalizedAction}
          />
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

    let torrentClasses = torrentStatusClasses(torrent, 'torrent-details__header');
    let torrentStatusIcon = torrentStatusIcons(torrent.status);

    return (
      <div className={torrentClasses}>
        <h1 className="torrent-details__heading torrent-details--name">{torrent.name}</h1>
        <div className="torrent-details__sub-heading">
          <ul className="torrent-details__sub-heading__secondary">
            <li className="torrent-details__sub-heading__tertiary torrent-details__sub-heading__tertiary--download">
              <DownloadThickIcon />
              <Size value={torrent.downloadRate} isSpeed={true} />
              &nbsp;&mdash;&nbsp;
              <Size value={torrent.bytesDone} />
            </li>
            <li className="torrent-details__sub-heading__tertiary torrent-details__sub-heading__tertiary--upload">
              <UploadThickIcon />
              <Size value={torrent.uploadRate} isSpeed={true} />
              &nbsp;&mdash;&nbsp;
              <Size value={torrent.uploadTotal} />
            </li>
            <li className="torrent-details__sub-heading__tertiary">
              <RatioIcon />
              <Ratio value={torrent.ratio} />
            </li>
            <li className="torrent-details__sub-heading__tertiary">
              <ClockIcon />
              <Duration value={torrent.eta} />
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
