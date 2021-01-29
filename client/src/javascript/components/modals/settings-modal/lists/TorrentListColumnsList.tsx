import {Component, ReactNode} from 'react';
import {Trans} from '@lingui/react';

import {Checkbox} from '@client/ui';
import {Error} from '@client/ui/icons';
import SettingStore from '@client/stores/SettingStore';
import TorrentListColumns from '@client/constants/TorrentListColumns';

import type {TorrentListColumn} from '@client/constants/TorrentListColumns';

import type {FloodSettings} from '@shared/types/FloodSettings';

import SortableList from '../../../general/SortableList';
import Tooltip from '../../../general/Tooltip';

import type {ListItem} from '../../../general/SortableList';

interface TorrentListColumnsListProps {
  torrentListViewSize: FloodSettings['torrentListViewSize'];
  onSettingsChange: (changedSettings: Partial<FloodSettings>) => void;
}

interface TorrentListColumnsListStates {
  torrentListColumns: FloodSettings['torrentListColumns'];
}

class TorrentListColumnsList extends Component<TorrentListColumnsListProps, TorrentListColumnsListStates> {
  tooltipRef: Tooltip | null = null;

  constructor(props: TorrentListColumnsListProps) {
    super(props);

    const {torrentListColumns} = SettingStore.floodSettings;

    const torrentListColumnItems: ListItem[] = torrentListColumns
      .filter((column) => TorrentListColumns[column.id] != null)
      .slice();

    const newTorrentListColumnItems: ListItem[] = Object.keys(TorrentListColumns)
      .filter((key) => torrentListColumns.every((column) => column.id !== key))
      .map((newColumn) => ({
        id: newColumn,
        visible: false,
      }));

    this.state = {
      torrentListColumns: torrentListColumnItems.concat(
        newTorrentListColumnItems,
      ) as FloodSettings['torrentListColumns'],
    };
  }

  getLockedIDs(): Array<TorrentListColumn> {
    if (this.props.torrentListViewSize === 'expanded') {
      return ['name', 'eta', 'downRate', 'percentComplete', 'downTotal', 'upRate'];
    }

    return [];
  }

  handleCheckboxValueChange = (id: string, value: boolean): void => {
    const {torrentListColumns} = this.state;

    const changedTorrentListColumns = torrentListColumns.map((column) => ({
      id: column.id,
      visible: column.id === id ? value : column.visible,
    }));

    this.props.onSettingsChange({
      torrentListColumns: changedTorrentListColumns,
    });
    this.setState({torrentListColumns: changedTorrentListColumns});
  };

  handleMouseDown = (): void => {
    if (this.tooltipRef != null) {
      this.tooltipRef.dismissTooltip();
    }
  };

  handleMove = (items: Array<ListItem>): void => {
    const changedItems = items.slice() as FloodSettings['torrentListColumns'];
    this.setState({torrentListColumns: changedItems});
    this.props.onSettingsChange({torrentListColumns: changedItems});
  };

  renderItem = (item: ListItem, index: number): ReactNode => {
    const {id, visible} = item as FloodSettings['torrentListColumns'][number];
    let checkbox = null;
    let warning = null;

    if (!this.getLockedIDs().includes(id)) {
      checkbox = (
        <span className="sortable-list__content sortable-list__content--secondary">
          <Checkbox
            defaultChecked={visible}
            onClick={(event) => this.handleCheckboxValueChange(id, (event.target as HTMLInputElement).checked)}>
            <Trans id="settings.ui.torrent.details.enabled" />
          </Checkbox>
        </span>
      );
    }

    if (
      id === 'tags' &&
      this.props.torrentListViewSize === 'expanded' &&
      index < this.state.torrentListColumns.length - 1
    ) {
      const tooltipContent = <Trans id="settings.ui.torrent.details.tags.placement" />;

      warning = (
        <Tooltip
          className="tooltip tooltip--is-error"
          content={tooltipContent}
          offset={-5}
          ref={(ref) => {
            this.tooltipRef = ref;
          }}
          width={200}
          wrapperClassName="sortable-list__content sortable-list__content--secondary tooltip__wrapper"
          wrapText>
          <Error />
        </Tooltip>
      );
    }

    const content = (
      <div className="sortable-list__content sortable-list__content__wrapper">
        {warning}
        <span className="sortable-list__content sortable-list__content--primary">
          <Trans id={TorrentListColumns[id]} />
        </span>
        {checkbox}
      </div>
    );

    return content;
  };

  render(): ReactNode {
    const lockedIDs = this.getLockedIDs();

    return (
      <SortableList
        id="torrent-details"
        className="sortable-list--torrent-details"
        items={this.state.torrentListColumns}
        lockedIDs={lockedIDs}
        onMouseDown={this.handleMouseDown}
        onDrop={this.handleMove}
        renderItem={this.renderItem}
      />
    );
  }
}

export default TorrentListColumnsList;
