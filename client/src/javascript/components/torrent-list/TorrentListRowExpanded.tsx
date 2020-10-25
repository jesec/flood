import {FormattedNumber} from 'react-intl';
import {observer} from 'mobx-react';
import React from 'react';

import type {TorrentProperties} from '@shared/types/Torrent';

import {getTorrentListCellContent} from '../../util/torrentListCellContents';
import ProgressBar from '../general/ProgressBar';
import SettingStore from '../../stores/SettingStore';
import Size from '../general/Size';
import TorrentListCell from './TorrentListCell';
import torrentStatusIcons from '../../util/torrentStatusIcons';
import TorrentStore from '../../stores/TorrentStore';

interface TorrentListRowExpandedProps {
  className: string;
  hash: string;
  handleClick: (torrent: TorrentProperties, event: React.MouseEvent) => void;
  handleDoubleClick: (torrent: TorrentProperties, event: React.MouseEvent) => void;
  handleRightClick: (torrent: TorrentProperties, event: React.MouseEvent) => void;
  handleTouchStart: (event: React.TouchEvent) => void;
  handleTouchEnd: (event: React.TouchEvent) => void;
}

const TorrentListRowExpanded = React.forwardRef<HTMLLIElement, TorrentListRowExpandedProps>(
  (
    {
      className,
      hash,
      handleClick,
      handleDoubleClick,
      handleRightClick,
      handleTouchStart,
      handleTouchEnd,
    }: TorrentListRowExpandedProps,
    ref,
  ) => {
    const torrent = TorrentStore.torrents[hash];
    const columns = SettingStore.floodSettings.torrentListColumns;

    const primarySection: React.ReactNodeArray = [];
    const secondarySection: React.ReactNodeArray = [];
    const tertiarySection: React.ReactNodeArray = [];

    // Using a for loop to maximize performance.
    for (let index = 0; index < columns.length; index += 1) {
      const {id, visible} = columns[index];

      if (visible) {
        switch (id) {
          case 'name':
            primarySection.push(
              <TorrentListCell
                key={id}
                column={id}
                className="torrent__details__section torrent__details__section--primary"
                content={getTorrentListCellContent(torrent, id)}
              />,
            );
            break;
          case 'downRate':
          case 'upRate':
          case 'eta':
            secondarySection.push(
              <TorrentListCell key={id} column={id} content={getTorrentListCellContent(torrent, id)} showIcon />,
            );
            break;
          case 'downTotal':
            break;
          case 'percentComplete':
            tertiarySection.push(
              <TorrentListCell
                key={id}
                column={id}
                content={
                  <span>
                    <FormattedNumber value={torrent.percentComplete} />
                    <em className="unit">%</em>
                    &nbsp;&mdash;&nbsp;
                    <Size value={torrent.downTotal} />
                  </span>
                }
                showIcon
              />,
            );
            break;
          default:
            tertiarySection.push(
              <TorrentListCell key={id} column={id} content={getTorrentListCellContent(torrent, id)} showIcon />,
            );
            break;
        }
      }
    }

    return (
      <li
        className={className}
        onClick={handleClick.bind(this, torrent)}
        onContextMenu={handleRightClick.bind(this, torrent)}
        onDoubleClick={handleDoubleClick.bind(this, torrent)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        ref={ref}>
        <div className="torrent__details__section__wrapper">
          {primarySection}
          <div className="torrent__details__section torrent__details__section--secondary">{secondarySection}</div>
        </div>
        <div className="torrent__details__section torrent__details__section--tertiary">{tertiarySection}</div>
        <div className="torrent__details__section torrent__details__section--quaternary">
          <ProgressBar percent={torrent.percentComplete} icon={torrentStatusIcons(torrent.status)} />
        </div>
      </li>
    );
  },
);

export default observer(TorrentListRowExpanded);
