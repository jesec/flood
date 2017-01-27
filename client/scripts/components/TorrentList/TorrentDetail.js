import {FormattedDate, FormattedMessage, FormattedNumber} from 'react-intl';
import React from 'react';

import CalendarIcon from '../Icons/CalendarIcon';
import ClockIcon from '../Icons/ClockIcon';
import DiskIcon from '../Icons/DiskIcon';
import DownloadThickIcon from '../Icons/DownloadThickIcon';
import Duration from '../General/Duration';
import PeersIcon from '../Icons/PeersIcon';
import Ratio from '../General/Ratio';
import RatioIcon from '../Icons/RatioIcon';
import SeedsIcon from '../Icons/SeedsIcon';
import Size from '../General/Size';
import UploadThickIcon from '../Icons/UploadThickIcon';

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
  completed: <DownloadThickIcon />,
  eta: <ClockIcon />,
  sizeBytes: <DiskIcon />,
  downloadRate: <DownloadThickIcon />,
  added: <CalendarIcon />,
  peers: <PeersIcon />,
  ratio: <RatioIcon />,
  seeds: <SeedsIcon />,
  uploadRate: <UploadThickIcon />,
  uploadTotal: <UploadThickIcon />
};

const renderers = {
  added: date => <FormattedDate value={date * 1000} />,
  completed: (percent, size) => {
    return (
      <span>
        <FormattedNumber value={percent} />
        <em className="unit">%</em>
        &nbsp;&mdash;&nbsp;
        <Size value={size} />
      </span>
    );
  },
  downloadRate: speedRenderer,
  downloadTotal: sizeRenderer,
  seeds: peersRenderer,
  peers: peersRenderer,
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
    let {className, icon, secondaryValue, slug, value, width} = this.props;

    if (slug in renderers) {
      value = renderers[slug](value, secondaryValue);
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
  className: ''
};

export default TorrentDetail;
