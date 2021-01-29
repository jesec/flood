import {Component} from 'react';
import {Trans} from '@lingui/react';

import {Checkbox} from '@client/ui';
import SettingStore from '@client/stores/SettingStore';
import SortableList, {ListItem} from '@client/components/general/SortableList';
import Tooltip from '@client/components/general/Tooltip';
import TorrentContextMenuActions from '@client/constants/TorrentContextMenuActions';

import type {TorrentContextMenuAction} from '@client/constants/TorrentContextMenuActions';

import type {FloodSettings} from '@shared/types/FloodSettings';

interface TorrentContextMenuActionsListProps {
  onSettingsChange: (changedSettings: Partial<FloodSettings>) => void;
}

interface TorrentContextMenuActionsListStates {
  torrentContextMenuActions: FloodSettings['torrentContextMenuActions'];
}

const lockedIDs: Array<TorrentContextMenuAction> = ['start', 'stop', 'setTaxonomy', 'torrentDetails'];

class TorrentContextMenuActionsList extends Component<
  TorrentContextMenuActionsListProps,
  TorrentContextMenuActionsListStates
> {
  tooltipRef: Tooltip | null = null;

  constructor(props: TorrentContextMenuActionsListProps) {
    super(props);

    const {torrentContextMenuActions} = SettingStore.floodSettings;

    this.state = {
      torrentContextMenuActions: Object.keys(TorrentContextMenuActions).map((key) => ({
        id: key,
        visible: torrentContextMenuActions.some((setting) => setting.id === key && setting.visible),
      })) as FloodSettings['torrentContextMenuActions'],
    };
  }

  updateSettings = (torrentContextMenuActions: FloodSettings['torrentContextMenuActions']) => {
    this.props.onSettingsChange({torrentContextMenuActions});
  };

  handleCheckboxValueChange = (id: string, value: boolean) => {
    let {torrentContextMenuActions} = this.state;

    torrentContextMenuActions = torrentContextMenuActions.map((setting) => ({
      id: setting.id,
      visible: setting.id === id ? value : setting.visible,
    }));

    this.props.onSettingsChange({torrentContextMenuActions});
    this.setState({torrentContextMenuActions});
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
    const {id, visible} = item as FloodSettings['torrentContextMenuActions'][number];
    let checkbox = null;

    if (!lockedIDs.includes(id)) {
      checkbox = (
        <span className="sortable-list__content sortable-list__content--secondary">
          <Checkbox
            defaultChecked={visible}
            onClick={(event) => this.handleCheckboxValueChange(id, (event.target as HTMLInputElement).checked)}>
            <Trans id="settings.ui.torrent.context.menu.items.show" />
          </Checkbox>
        </span>
      );
    }

    const content = (
      <div className="sortable-list__content sortable-list__content__wrapper">
        <span className="sortable-list__content sortable-list__content--primary">
          <Trans id={TorrentContextMenuActions[id]} />
        </span>
        {checkbox}
      </div>
    );

    return content;
  };

  render() {
    return (
      <SortableList
        id="torrent-context-menu-items"
        className="sortable-list--torrent-context-menu-items"
        items={this.state.torrentContextMenuActions}
        lockedIDs={lockedIDs}
        isDraggable={false}
        onMouseDown={this.handleMouseDown}
        onDrop={this.handleMove}
        renderItem={this.renderItem}
      />
    );
  }
}

export default TorrentContextMenuActionsList;
