import {CSSProperties, FC, forwardRef, KeyboardEvent, MouseEvent, ReactElement, TouchEvent} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';

import SettingStore from '@client/stores/SettingStore';
import TorrentListColumns from '@client/constants/TorrentListColumns';

import Size from '../general/Size';
import TorrentListCell from './TorrentListCell';

import type {TorrentListCellContentProps} from './TorrentListCell';

interface TorrentListRowExpandedProps {
  className: string;
  style: CSSProperties;
  hash: string;
  handleClick: (hash: string, event: KeyboardEvent | MouseEvent) => void;
  handleDoubleClick: (hash: string) => void;
  handleRightClick: (hash: string, event: KeyboardEvent | MouseEvent) => void;
  handleTouchStart: (event: TouchEvent) => void;
  handleTouchEnd: (event: TouchEvent) => void;
  handleKeyPress: (event: KeyboardEvent) => void;
}

const TorrentListCellPercentageNumber: FC<TorrentListCellContentProps> = observer(
  ({torrent}: TorrentListCellContentProps) => {
    const {i18n} = useLingui();
    return (
      <span>
        {i18n.number(torrent.percentComplete, {maximumFractionDigits: 1})}
        <em className="unit">%</em>
        &nbsp;&mdash;&nbsp;
        <Size value={torrent.downTotal} />
      </span>
    );
  },
);

const TorrentListRowExpanded = observer(
  forwardRef<HTMLDivElement, TorrentListRowExpandedProps>(
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
        handleKeyPress,
      }: TorrentListRowExpandedProps,
      ref,
    ) => {
      const columns = SettingStore.floodSettings.torrentListColumns;

      const primarySection: Array<ReactElement> = [
        <TorrentListCell
          key="name"
          hash={hash}
          column="name"
          className="torrent__details__section torrent__details__section--primary"
        />,
      ];
      const secondarySection: Array<ReactElement> = [
        <TorrentListCell key="eta" hash={hash} column="eta" showIcon />,
        <TorrentListCell key="downRate" hash={hash} column="downRate" showIcon />,
        <TorrentListCell key="upRate" hash={hash} column="upRate" showIcon />,
      ];
      const tertiarySection: Array<ReactElement> = [
        <TorrentListCell
          key="percentComplete"
          hash={hash}
          column="percentComplete"
          content={TorrentListCellPercentageNumber}
          showIcon
        />,
      ];
      const quaternarySection: Array<ReactElement> = [
        <TorrentListCell
          key="percentBar"
          hash={hash}
          column="percentComplete"
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
        <div
          className={className}
          role="row"
          style={style}
          tabIndex={0}
          onClick={(e) => handleClick(hash, e)}
          onContextMenu={(e) => handleRightClick(hash, e)}
          onDoubleClick={() => handleDoubleClick(hash)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onKeyPress={handleKeyPress}
          ref={ref}
        >
          <div css={{alignItems: 'center', display: 'flex'}}>
            {primarySection}
            <div className="torrent__details__section torrent__details__section--secondary">{secondarySection}</div>
          </div>
          <div className="torrent__details__section torrent__details__section--tertiary">{tertiarySection}</div>
          {quaternarySection}
        </div>
      );
    },
  ),
);

export default TorrentListRowExpanded;
