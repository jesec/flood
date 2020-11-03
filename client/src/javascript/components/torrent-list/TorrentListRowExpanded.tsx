import {FormattedNumber} from 'react-intl';
import {observer} from 'mobx-react';
import * as React from 'react';

import ProgressBar from '../general/ProgressBar';
import SettingStore from '../../stores/SettingStore';
import Size from '../general/Size';
import TorrentListCell from './TorrentListCell';
import TorrentListColumns from '../../constants/TorrentListColumns';
import torrentStatusIcons from '../../util/torrentStatusIcons';

interface TorrentListRowExpandedProps {
  className: string;
  style: React.CSSProperties;
  hash: string;
  handleClick: (hash: string, event: React.MouseEvent) => void;
  handleDoubleClick: (hash: string, event: React.MouseEvent) => void;
  handleRightClick: (hash: string, event: React.MouseEvent) => void;
  handleTouchStart: (event: React.TouchEvent) => void;
  handleTouchEnd: (event: React.TouchEvent) => void;
}

const TorrentListRowExpanded = React.forwardRef<HTMLLIElement, TorrentListRowExpandedProps>(
  (
    {
      className,
      style,
      hash,
      handleClick,
      handleDoubleClick,
      handleRightClick,
      handleTouchStart,
      handleTouchEnd,
    }: TorrentListRowExpandedProps,
    ref,
  ) => {
    const columns = SettingStore.floodSettings.torrentListColumns;

    const primarySection: React.ReactNodeArray = [
      <TorrentListCell
        key="name"
        hash={hash}
        column="name"
        className="torrent__details__section torrent__details__section--primary"
      />,
    ];
    const secondarySection: React.ReactNodeArray = [
      <TorrentListCell key="eta" hash={hash} column="eta" showIcon />,
      <TorrentListCell key="downRate" hash={hash} column="downRate" showIcon />,
      <TorrentListCell key="upRate" hash={hash} column="upRate" showIcon />,
    ];
    const tertiarySection: React.ReactNodeArray = [
      <TorrentListCell
        key="percentComplete"
        hash={hash}
        column="percentComplete"
        content={(torrent) => (
          <span>
            <FormattedNumber value={torrent.percentComplete} />
            <em className="unit">%</em>
            &nbsp;&mdash;&nbsp;
            <Size value={torrent.downTotal} />
          </span>
        )}
        showIcon
      />,
    ];
    const quaternarySection: React.ReactNodeArray = [
      <TorrentListCell
        key="percentBar"
        hash={hash}
        column="percentComplete"
        content={(torrent) => (
          <ProgressBar percent={torrent.percentComplete} icon={torrentStatusIcons(torrent.status)} />
        )}
        className="torrent__details__section torrent__details__section--quaternary"
        classNameOverride
      />,
    ];

    // Using a for loop to maximize performance.
    for (let index = 0; index < columns.length; index += 1) {
      const {id, visible} = columns[index];

      if (TorrentListColumns[id] != null && visible) {
        switch (id) {
          case 'name':
            break;
          case 'downRate':
          case 'upRate':
          case 'eta':
            break;
          case 'downTotal':
          case 'percentComplete':
            break;
          default:
            tertiarySection.push(<TorrentListCell key={id} hash={hash} column={id} showIcon />);
            break;
        }
      }
    }

    return (
      <li
        className={className}
        style={style}
        onClick={(e) => handleClick(hash, e)}
        onContextMenu={(e) => handleRightClick(hash, e)}
        onDoubleClick={(e) => handleDoubleClick(hash, e)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        ref={ref}>
        <div className="torrent__details__section__wrapper">
          {primarySection}
          <div className="torrent__details__section torrent__details__section--secondary">{secondarySection}</div>
        </div>
        <div className="torrent__details__section torrent__details__section--tertiary">{tertiarySection}</div>
        {quaternarySection}
      </li>
    );
  },
);

export default observer(TorrentListRowExpanded);
