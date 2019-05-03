import {FormattedMessage} from 'react-intl';
import classnames from 'classnames';
import React from 'react';
import stringUtil from 'universally-shared-code/util/stringUtil';
import torrentStatusMap from 'universally-shared-code/constants/torrentStatusMap';

import ClockIcon from '../../icons/ClockIcon';
import DownloadThickIcon from '../../icons/DownloadThickIcon';
import Duration from '../../general/Duration';
import PriorityMeter from '../../general/filesystem/PriorityMeter';
import ProgressBar from '../../general/ProgressBar';
import Ratio from '../../general/Ratio';
import RatioIcon from '../../icons/RatioIcon';
import Size from '../../general/Size';
import StartIcon from '../../icons/StartIcon';
import StopIcon from '../../icons/StopIcon';
import TorrentActions from '../../../actions/TorrentActions';
import {torrentStatusClasses} from '../../../util/torrentStatusClasses';
import {torrentStatusIcons} from '../../../util/torrentStatusIcons';
import UploadThickIcon from '../../icons/UploadThickIcon';

const METHODS_TO_BIND = ['getCurrentStatus', 'handleStart', 'handleStop'];

export default class TorrentHeading extends React.Component {
  constructor() {
    super();

    this.state = {
      optimisticData: {currentStatus: null},
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps() {
    if (this.state.optimisticData.currentStatus) {
      this.setState({optimisticData: {currentStatus: null}});
    }
  }

  getCurrentStatus(torrentStatus) {
    if (torrentStatus.includes(torrentStatusMap.stopped)) {
      return 'stop';
    }
    return 'start';
  }

  getTorrentActions(torrent) {
    const currentStatus = this.state.optimisticData.currentStatus || this.getCurrentStatus(torrent.status);
    const statusIcons = {
      start: <StartIcon />,
      stop: <StopIcon />,
    };
    const torrentActions = ['start', 'stop'];
    const torrentActionElements = [
      <li className="torrent-details__sub-heading__tertiary" key={torrentActions.length + 1}>
        <PriorityMeter
          id={torrent.hash}
          level={torrent.priority}
          maxLevel={3}
          priorityType="torrent"
          onChange={this.handlePriorityChange}
          showLabel
        />
      </li>,
    ];

    torrentActions.forEach((torrentAction, index) => {
      const capitalizedAction = stringUtil.capitalize(torrentAction);
      const classes = classnames('torrent-details__sub-heading__tertiary', 'torrent-details__action', {
        'is-active': torrentAction === currentStatus,
      });

      torrentActionElements.push(
        // TODO: Find a better key
        // eslint-disable-next-line react/no-array-index-key
        <li className={classes} key={index} onClick={this[`handle${capitalizedAction}`]}>
          {statusIcons[torrentAction]}
          <FormattedMessage id={`torrents.details.actions.${torrentAction}`} defaultMessage={capitalizedAction} />
        </li>,
      );
    });

    return torrentActionElements;
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
    const {torrent} = this.props;
    const torrentClasses = torrentStatusClasses(torrent, 'torrent-details__header');
    const torrentStatusIcon = torrentStatusIcons(torrent.status);

    return (
      <div className={torrentClasses}>
        <h1 className="torrent-details__heading torrent-details--name">{torrent.name}</h1>
        <div className="torrent-details__sub-heading">
          <ul className="torrent-details__sub-heading__secondary">
            <li className="torrent-details__sub-heading__tertiary torrent-details__sub-heading__tertiary--download">
              <DownloadThickIcon />
              <Size value={torrent.downRate} isSpeed />
              &nbsp;&mdash;&nbsp;
              <Size value={torrent.bytesDone} />
            </li>
            <li className="torrent-details__sub-heading__tertiary torrent-details__sub-heading__tertiary--upload">
              <UploadThickIcon />
              <Size value={torrent.upRate} isSpeed />
              &nbsp;&mdash;&nbsp;
              <Size value={torrent.upTotal} />
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
          <ul className="torrent-details__sub-heading__secondary">{this.getTorrentActions(torrent)}</ul>
        </div>
        <ProgressBar percent={torrent.percentComplete} icon={torrentStatusIcon} />
      </div>
    );
  }
}
