import {FormattedMessage, FormattedNumber} from 'react-intl';
import classnames from 'classnames';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import React from 'react';

import type {TorrentProperties} from '@shared/types/Torrent';

import ClockIcon from '../../icons/ClockIcon';
import DownloadThickIcon from '../../icons/DownloadThickIcon';
import Duration from '../../general/Duration';
import PriorityMeter from '../../general/filesystem/PriorityMeter';
import ProgressBar from '../../general/ProgressBar';
import RatioIcon from '../../icons/RatioIcon';
import Size from '../../general/Size';
import StartIcon from '../../icons/StartIcon';
import StopIcon from '../../icons/StopIcon';
import TorrentActions from '../../../actions/TorrentActions';
import torrentStatusClasses from '../../../util/torrentStatusClasses';
import torrentStatusIcons from '../../../util/torrentStatusIcons';
import TorrentStore from '../../../stores/TorrentStore';
import UploadThickIcon from '../../icons/UploadThickIcon';
import UIStore from '../../../stores/UIStore';

const getCurrentStatus = (statuses: TorrentProperties['status']) => {
  if (statuses.includes('stopped')) {
    return 'stop';
  }
  return 'start';
};

@observer
class TorrentHeading extends React.Component {
  @observable torrentStatus: 'start' | 'stop' = 'stop';

  render() {
    if (UIStore.activeModal?.id !== 'torrent-details') {
      return null;
    }

    const torrent = TorrentStore.torrents[UIStore?.activeModal?.hash];
    if (torrent == null) {
      return null;
    }

    const torrentClasses = torrentStatusClasses(torrent, 'torrent-details__header');
    const torrentStatusIcon = torrentStatusIcons(torrent.status);
    this.torrentStatus = getCurrentStatus(torrent.status);

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
              <FormattedNumber value={torrent.ratio} />
            </li>
            <li className="torrent-details__sub-heading__tertiary">
              <ClockIcon />
              <Duration value={torrent.eta} />
            </li>
          </ul>
          <ul className="torrent-details__sub-heading__secondary">
            <li className="torrent-details__sub-heading__tertiary" key="priority-meter">
              <PriorityMeter
                id={torrent.hash}
                level={torrent.priority}
                maxLevel={3}
                priorityType="torrent"
                onChange={(hash, level) => {
                  TorrentActions.setPriority({hashes: [`${hash}`], priority: level});
                }}
              />
            </li>
            <li
              className={classnames('torrent-details__sub-heading__tertiary', 'torrent-details__action', {
                'is-active': this.torrentStatus === 'start',
              })}
              key="start"
              onClick={() => {
                this.torrentStatus = 'start';
                TorrentActions.startTorrents({
                  hashes: [torrent.hash],
                });
              }}>
              <StartIcon />
              <FormattedMessage id="torrents.details.actions.start" />
            </li>
            <li
              className={classnames('torrent-details__sub-heading__tertiary', 'torrent-details__action', {
                'is-active': this.torrentStatus === 'stop',
              })}
              key="stop"
              onClick={() => {
                this.torrentStatus = 'stop';
                TorrentActions.stopTorrents({
                  hashes: [torrent.hash],
                });
              }}>
              <StopIcon />
              <FormattedMessage id="torrents.details.actions.stop" />
            </li>
          </ul>
        </div>
        <ProgressBar percent={torrent.percentComplete} icon={torrentStatusIcon} />
      </div>
    );
  }
}

export default TorrentHeading;
