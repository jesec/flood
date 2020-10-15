import classnames from 'classnames';
import React from 'react';

import type {TorrentProperties} from '@shared/types/Torrent';
import type {FloodSettings} from '@shared/types/FloodSettings';

import torrentStatusClasses from '../../util/torrentStatusClasses';

import TorrentListRowCondensed from './TorrentListRowCondensed';
import TorrentListRowExpanded from './TorrentListRowExpanded';

interface TorrentListRowProps {
  torrent: TorrentProperties;
  columns: FloodSettings['torrentListColumns'];
  columnWidths: FloodSettings['torrentListColumnWidths'];
  isSelected: boolean;
  isCondensed: boolean;
  handleClick: (torrent: TorrentProperties, event: React.MouseEvent) => void;
  handleDoubleClick: (torrent: TorrentProperties, event: React.MouseEvent) => void;
  handleRightClick: (torrent: TorrentProperties, event: React.MouseEvent) => void;
}

class TorrentListRow extends React.PureComponent<TorrentListRowProps> {
  torrentRef: HTMLLIElement | null = null;
  handleRightClick: (event: React.MouseEvent) => void;

  static defaultProps = {
    isCondensed: false,
  };

  constructor(props: TorrentListRowProps) {
    super(props);

    const {handleRightClick, torrent} = props;

    this.handleRightClick = handleRightClick.bind(this, torrent);
  }

  componentDidMount(): void {
    if (this.torrentRef != null) {
      this.torrentRef.addEventListener('long-press', (e) => this.handleRightClick((e as unknown) as React.MouseEvent));
    }
  }

  componentWillUnmount(): void {
    if (this.torrentRef != null) {
      this.torrentRef.removeEventListener('long-press', (e) =>
        this.handleRightClick((e as unknown) as React.MouseEvent),
      );
    }
  }

  render(): React.ReactNode {
    const {
      isCondensed,
      isSelected,
      columns,
      columnWidths,
      torrent,
      handleClick,
      handleDoubleClick,
      handleRightClick,
    } = this.props;
    const torrentClasses = torrentStatusClasses(
      torrent,
      classnames({
        'torrent--is-selected': isSelected,
        'torrent--is-condensed': isCondensed,
        'torrent--is-expanded': !isCondensed,
      }),
      'torrent',
    );

    if (isCondensed) {
      return (
        <TorrentListRowCondensed
          className={torrentClasses}
          columns={columns}
          columnWidths={columnWidths}
          torrent={torrent}
          handleClick={handleClick}
          handleDoubleClick={handleDoubleClick}
          handleRightClick={handleRightClick}
        />
      );
    }

    return (
      <TorrentListRowExpanded
        className={torrentClasses}
        columns={columns}
        torrent={torrent}
        handleClick={handleClick}
        handleDoubleClick={handleDoubleClick}
        handleRightClick={handleRightClick}
      />
    );
  }
}

export default TorrentListRow;
