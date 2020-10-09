import React from 'react';
import {FormattedMessage} from 'react-intl';

import type {FloodSettings} from '@shared/types/FloodSettings';

import {Checkbox} from '../../../../ui';
import ErrorIcon from '../../../icons/ErrorIcon';
import SettingsStore from '../../../../stores/SettingsStore';
import SortableList, {ListItem} from '../../../general/SortableList';
import Tooltip from '../../../general/Tooltip';
import TorrentContextMenuItems from '../../../../constants/TorrentContextMenuItems';

interface TorrentContextMenuItemsListProps {
  onSettingsChange: (changedSettings: Partial<FloodSettings>) => void;
}

interface TorrentContextMenuItemsListStates {
  torrentContextMenuItems: FloodSettings['torrentContextMenuItems'];
}

const lockedIDs = ['start', 'stop', 'set-taxonomy', 'torrent-details'];

class TorrentContextMenuItemsList extends React.Component<
  TorrentContextMenuItemsListProps,
  TorrentContextMenuItemsListStates
> {
  tooltipRef: Tooltip | null = null;

  constructor(props: TorrentContextMenuItemsListProps) {
    super(props);

    this.state = {
      torrentContextMenuItems: SettingsStore.getFloodSetting('torrentContextMenuItems'),
    };
  }

  updateSettings = (torrentContextMenuItems: FloodSettings['torrentContextMenuItems']) => {
    this.props.onSettingsChange({torrentContextMenuItems});
  };

  handleCheckboxValueChange = (id: string, value: boolean) => {
    let {torrentContextMenuItems} = this.state;

    torrentContextMenuItems = torrentContextMenuItems.map((setting) => {
      return {
        id: setting.id,
        visible: setting.id === id ? value : setting.visible,
      };
    });

    this.props.onSettingsChange({torrentContextMenuItems});
    this.setState({torrentContextMenuItems});
  };

  handleMouseDown = () => {
    if (this.tooltipRef != null) {
      this.tooltipRef.dismissTooltip();
    }
  };

  handleMove = () => {
    // do nothing.
  };

  renderItem = (item: ListItem) => {
    const {id, visible} = item as FloodSettings['torrentContextMenuItems'][number];
    let checkbox = null;
    let warning = null;

    if (!lockedIDs.includes(id)) {
      checkbox = (
        <span className="sortable-list__content sortable-list__content--secondary">
          <Checkbox
            checked={visible}
            onChange={(event) => this.handleCheckboxValueChange(id, (event.target as HTMLInputElement).checked)}>
            <FormattedMessage id="settings.ui.torrent.context.menu.items.show" />
          </Checkbox>
        </span>
      );
    }

    if (id === 'set-tracker') {
      const tooltipContent = <FormattedMessage id={TorrentContextMenuItems[id].warning} />;

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
          <FormattedMessage id={TorrentContextMenuItems[id].id} />
        </span>
        {checkbox}
      </div>
    );

    return content;
  };

  render() {
    const {torrentContextMenuItems} = this.state;

    return (
      <SortableList
        id="torrent-context-menu-items"
        className="sortable-list--torrent-context-menu-items"
        items={torrentContextMenuItems}
        lockedIDs={lockedIDs}
        isDraggable={false}
        onMouseDown={this.handleMouseDown}
        onDrop={this.handleMove}
        renderItem={this.renderItem}
      />
    );
  }
}

export default TorrentContextMenuItemsList;
