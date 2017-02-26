import {FormattedDate, FormattedMessage, FormattedNumber} from 'react-intl';
import React from 'react';

import CalendarCreatedIcon from '../Icons/CalendarCreatedIcon';
import CalendarIcon from '../Icons/CalendarIcon';
import Checkmark from '../Icons/Checkmark';
import ClockIcon from '../Icons/ClockIcon';
import CommentIcon from '../Icons/CommentIcon';
import DetailNotAvailableIcon from '../Icons/DetailNotAvailableIcon';
import DiskIcon from '../Icons/DiskIcon';
import DownloadThickIcon from '../Icons/DownloadThickIcon';
import Duration from '../General/Duration';
import HashIcon from '../Icons/HashIcon';
import FolderClosedSolid from '../Icons/FolderClosedSolid';
import PeersIcon from '../Icons/PeersIcon';
import LockIcon from '../Icons/LockIcon';
import Ratio from '../General/Ratio';
import RadarIcon from '../Icons/RadarIcon';
import RatioIcon from '../Icons/RatioIcon';
import SeedsIcon from '../Icons/SeedsIcon';
import Size from '../General/Size';
import TrackerMessageIcon from '../Icons/TrackerMessageIcon';
import UploadThickIcon from '../Icons/UploadThickIcon';

const booleanRenderer = (value = '') => {
  return Number(value) === 1 ? icons.checkmark : null;
};
const dateRenderer = date => <FormattedDate value={date * 1000} />;
const peersRenderer = (connectedPeers, totalPeers) => {
  return (
    <FormattedMessage
      id="torrent.list.peers"
      defaultMessage="{connected} {of} {total}"
      values={{
        connected: <FormattedNumber value={connectedPeers} />,
        of: (
          <em className="unit">
            <FormattedMessage id="torrent.list.peers.of"
              defaultMessage="of" />
          </em>
        ),
        total: <FormattedNumber value={totalPeers} />
      }} />
  );
};
const speedRenderer = value => <Size value={value} isSpeed={true} />;
const sizeRenderer = value => <Size value={value} />;

const icons = {
  checkmark: <Checkmark className="torrent__detail__icon torrent__detail__icon--checkmark" />,
  comment: <CommentIcon />,
  eta: <ClockIcon />,
  sizeBytes: <DiskIcon />,
  freeDiskSpace: <DiskIcon />,
  downloadRate: <DownloadThickIcon />,
  basePath: <FolderClosedSolid />,
  hash: <HashIcon />,
  added: <CalendarIcon />,
  creationDate: <CalendarCreatedIcon />,
  isPrivate: <LockIcon />,
  message: <TrackerMessageIcon />,
  percentComplete: <DownloadThickIcon />,
  peers: <PeersIcon />,
  ratio: <RatioIcon />,
  seeds: <SeedsIcon />,
  trackers: <RadarIcon />,
  uploadRate: <UploadThickIcon />,
  uploadTotal: <UploadThickIcon />
};

const transformers = {
  added: dateRenderer,
  creationDate: dateRenderer,
  downloadRate: speedRenderer,
  downloadTotal: sizeRenderer,
  freeDiskSpace: sizeRenderer,
  ignoreScheduler: booleanRenderer,
  isPrivate: booleanRenderer,
  percentComplete: (percent, size) => {
    return (
      <span>
        <FormattedNumber value={percent} />
        <em className="unit">%</em>
        &nbsp;&mdash;&nbsp;
        <Size value={size} />
      </span>
    );
  },
  peers: peersRenderer,
  seeds: peersRenderer,
  tags: tags => {
    return (
      <ul className="torrent__tags tag">
        {tags.map((tag, index) => {
          return (
            <li className="torrent__tag" key={index}>{tag}</li>
          );
        })}
      </ul>
    );
  },
  ratio: ratio => <Ratio value={ratio} />,
  sizeBytes: sizeRenderer,
  trackers: trackers => trackers.join(', '),
  uploadRate: speedRenderer,
  uploadTotal: sizeRenderer,
  eta: eta => {
    if (!eta) {
      return null;
    }

    return <Duration value={eta} />;
  }
};

class TorrentDetail extends React.PureComponent {
  render() {
    let {
      className,
      icon,
      preventTransform,
      secondaryValue,
      slug,
      value,
      width
    } = this.props;

    if (!preventTransform && slug in transformers) {
      value = transformers[slug](value, secondaryValue);
    }

    if (!value) {
      value = <DetailNotAvailableIcon />;
    }

    if (icon) {
      icon = icons[slug];
    }

    return (
      <div className={`torrent__detail torrent__detail--${slug} ${className}`}
        style={{width: `${width}px`}}>
        {icon}
        {value}
      </div>
    );
  }
}

TorrentDetail.defaultProps = {
  preventTransform: false,
  className: ''
};

export default TorrentDetail;
