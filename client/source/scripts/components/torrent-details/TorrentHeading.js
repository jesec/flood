import classNames from 'classnames';
import React from 'react';

import FolderOpenSolid from '../icons/FolderOpenSolid';
import DirectoryTree from '../filesystem/DirectoryTree';
import Download from '../icons/Download';
import ETA from '../icons/ETA';
import EventTypes from '../../constants/EventTypes';
import File from '../icons/File';
import format from '../../util/formatData';
import Pause from '../../components/icons/Pause';
import PriorityMeter from '../filesystem/PriorityMeter';
import ProgressBar from '../ui/ProgressBar';
import propsMap from '../../../../../shared/constants/propsMap';
import Ratio from '../../components/icons/Ratio';
import Start from '../../components/icons/Start';
import Stop from '../../components/icons/Stop';
import stringUtil from '../../../../../shared/util/stringUtil';
import TorrentActions from '../../actions/TorrentActions';
import TorrentStore from '../../stores/TorrentStore';
import {torrentStatusClasses} from '../../util/torrentStatusClasses';
import Upload from '../icons/Upload';

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
      'pause': <Pause />,
      'start': <Start />,
      'stop': <Stop />
    };
    let torrentActions = ['start', 'pause', 'stop'];

    torrentActions = torrentActions.map((torrentAction, index) => {
      let capitalizedAction = stringUtil.capitalize(torrentAction);
      let classes = 'torrent-details__sub-heading__tertiary torrent-details__action';

      if (torrentAction === currentStatus) {
        classes += ' is-active';
      }

      return (
        <li className={classes} key={index}
          onClick={this[`handle${capitalizedAction}`]}>
          {statusIcons[torrentAction]}
          {capitalizedAction}
        </li>
      );
    });

    torrentActions.push(
      <li className="torrent-details__sub-heading__tertiary"
        key={torrentActions.length + 1}>
        <PriorityMeter id={torrent.hash} key={torrent.hash}
          level={torrent.priority} maxLevel={3}
          onChange={this.handlePriorityChange} showLabel={true} />
      </li>
    );

    return torrentActions;
  }

  handlePause() {
    this.setState({optimisticData: {currentStatus: 'pause'}});
    TorrentActions.pauseTorrents([this.props.torrent.hash]);
  }

  handlePriorityChange(hash, level) {
    console.log(hash, level);
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

    return (
      <div className={torrentClasses}>
        <h1 className="torrent-details__heading torrent-details--name">{torrent.name}</h1>
        <div className="torrent-details__sub-heading">
          <ul className="torrent-details__sub-heading__secondary">
            <li className="torrent-details__sub-heading__tertiary torrent-details__sub-heading__tertiary--download">
              <Download />
              {downloadRate.value}
              <em className="unit">{downloadRate.unit}</em>
                &nbsp;&mdash;&nbsp;
                {completed.value}
                <em className="unit">{completed.unit}</em>
            </li>
            <li className="torrent-details__sub-heading__tertiary torrent-details__sub-heading__tertiary--upload">
              <Upload />
              {uploadRate.value}
              <em className="unit">{uploadRate.unit}</em>
              &nbsp;&mdash;&nbsp;
              {uploadTotal.value}
              <em className="unit">{uploadTotal.unit}</em>
            </li>
            <li className="torrent-details__sub-heading__tertiary">
              <Ratio />
              {ratio}
            </li>
            <li className="torrent-details__sub-heading__tertiary">
              <ETA />
              {eta}
            </li>
          </ul>
          <ul className="torrent-details__sub-heading__secondary">
            {this.getTorrentActions(torrent)}
          </ul>
        </div>
        <ProgressBar percent={torrent.percentComplete} />
      </div>
    );
  }
}
