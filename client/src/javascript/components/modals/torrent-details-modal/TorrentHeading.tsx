import {FormattedMessage} from 'react-intl';
import classnames from 'classnames';
import React from 'react';

import type {TorrentProperties} from '@shared/types/Torrent';

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
import torrentStatusClasses from '../../../util/torrentStatusClasses';
import torrentStatusIcons from '../../../util/torrentStatusIcons';
import UploadThickIcon from '../../icons/UploadThickIcon';

interface TorrentHeadingProps {
  torrent: TorrentProperties;
}

interface TorrentHeadingStates {
  optimisticData: {currentStatus: 'start' | 'stop' | null};
}

const getCurrentStatus = (statuses: TorrentProperties['status']) => {
  if (statuses.includes('stopped')) {
    return 'stop';
  }
  return 'start';
};

const METHODS_TO_BIND = ['handleStart', 'handleStop'] as const;

export default class TorrentHeading extends React.Component<TorrentHeadingProps, TorrentHeadingStates> {
  constructor(props: TorrentHeadingProps) {
    super(props);

    this.state = {
      optimisticData: {currentStatus: null},
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getTorrentActions(torrent: TorrentProperties) {
    const currentStatus = this.state.optimisticData.currentStatus || getCurrentStatus(torrent.status);
    const statusIcons = {
      start: <StartIcon />,
      stop: <StopIcon />,
    } as const;
    const torrentActions = ['start', 'stop'] as const;
    const torrentActionElements = [
      <li className="torrent-details__sub-heading__tertiary" key={torrentActions.length + 1}>
        <PriorityMeter
          id={torrent.hash}
          level={torrent.priority}
          maxLevel={3}
          priorityType="torrent"
          onChange={(hash, level) => {
            TorrentActions.setPriority({hashes: [`${hash}`], priority: level});
          }}
        />
      </li>,
    ];

    torrentActions.forEach((torrentAction) => {
      const classes = classnames('torrent-details__sub-heading__tertiary', 'torrent-details__action', {
        'is-active': torrentAction === currentStatus,
      });

      let clickHandler = null;
      switch (torrentAction) {
        case 'start':
          clickHandler = this.handleStart;
          break;
        case 'stop':
          clickHandler = this.handleStop;
          break;
        default:
          return;
      }

      torrentActionElements.push(
        <li className={classes} key={torrentAction} onClick={clickHandler}>
          {statusIcons[torrentAction]}
          <FormattedMessage id={`torrents.details.actions.${torrentAction}`} />
        </li>,
      );
    });

    return torrentActionElements;
  }

  handleStart() {
    this.setState({optimisticData: {currentStatus: 'start'}});
    TorrentActions.startTorrents({
      hashes: [this.props.torrent.hash],
    });
  }

  handleStop() {
    this.setState({optimisticData: {currentStatus: 'stop'}});
    TorrentActions.stopTorrents({
      hashes: [this.props.torrent.hash],
    });
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
