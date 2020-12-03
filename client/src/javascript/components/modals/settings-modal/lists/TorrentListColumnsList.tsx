import {FormattedMessage} from 'react-intl';
import * as React from 'react';

import type {FloodSettings} from '@shared/types/FloodSettings';

import {Checkbox} from '../../../../ui';
import ErrorIcon from '../../../icons/ErrorIcon';
import SettingStore from '../../../../stores/SettingStore';
import SortableList from '../../../general/SortableList';
import Tooltip from '../../../general/Tooltip';
import TorrentListColumns from '../../../../constants/TorrentListColumns';

import type {ListItem} from '../../../general/SortableList';
import type {TorrentListColumn} from '../../../../constants/TorrentListColumns';

interface TorrentListColumnsListProps {
  torrentListViewSize: FloodSettings['torrentListViewSize'];
  onSettingsChange: (changedSettings: Partial<FloodSettings>) => void;
}

interface TorrentListColumnsListStates {
  torrentListColumns: FloodSettings['torrentListColumns'];
}

class TorrentListColumnsList extends React.Component<TorrentListColumnsListProps, TorrentListColumnsListStates> {
  tooltipRef: Tooltip | null = null;

  constructor(props: TorrentListColumnsListProps) {
    super(props);

    const {torrentListColumns} = SettingStore.floodSettings;

    const torrentListColumnItems: ListItem[] = torrentListColumns
      .filter((column) => TorrentListColumns[column.id] != null)
      .slice();

    const newTorrentListColumnItems: ListItem[] = Object.keys(TorrentListColumns)
      .filter((key) => torrentListColumns.every((column) => column.id !== key))
      .map((newColumn) => {
        return {
          id: newColumn,
          visible: false,
        };
      });

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

    const changedTorrentListColumns = torrentListColumns.map((column) => {
      return {
        id: column.id,
        visible: column.id === id ? value : column.visible,
      };
    });

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

  renderItem = (item: ListItem, index: number): React.ReactNode => {
    const {id, visible} = item as FloodSettings['torrentListColumns'][number];
    let checkbox = null;
    let warning = null;

    if (!this.getLockedIDs().includes(id)) {
      checkbox = (
        <span className="sortable-list__content sortable-list__content--secondary">
          <Checkbox
            defaultChecked={visible}
            onClick={(event) => this.handleCheckboxValueChange(id, (event.target as HTMLInputElement).checked)}>
            <FormattedMessage id="settings.ui.torrent.details.enabled" />
          </Checkbox>
        </span>
      );
    }

    if (
      id === 'tags' &&
      this.props.torrentListViewSize === 'expanded' &&
      index < this.state.torrentListColumns.length - 1
    ) {
      const tooltipContent = <FormattedMessage id="settings.ui.torrent.details.tags.placement" />;

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
          <ErrorIcon />
        </Tooltip>
      );
    }

    const content = (
      <div className="sortable-list__content sortable-list__content__wrapper">
        {warning}
        <span className="sortable-list__content sortable-list__content--primary">
          <FormattedMessage id={TorrentListColumns[id].id} />
        </span>
        {checkbox}
      </div>
    );

    return content;
  };

  render(): React.ReactNode {
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
