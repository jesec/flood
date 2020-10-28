import {Component} from 'react';
import {FormattedMessage} from 'react-intl';

import type {FloodSettings} from '@shared/types/FloodSettings';

import {Checkbox} from '../../../../ui';
import SettingStore from '../../../../stores/SettingStore';
import SortableList, {ListItem} from '../../../general/SortableList';
import Tooltip from '../../../general/Tooltip';
import TorrentContextMenuActions from '../../../../constants/TorrentContextMenuActions';

import type {TorrentContextMenuAction} from '../../../../constants/TorrentContextMenuActions';

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

    this.state = {
      torrentContextMenuActions: SettingStore.floodSettings.torrentContextMenuActions,
    };
  }

  updateSettings = (torrentContextMenuActions: FloodSettings['torrentContextMenuActions']) => {
    this.props.onSettingsChange({torrentContextMenuActions});
  };

  handleCheckboxValueChange = (id: string, value: boolean) => {
    let {torrentContextMenuActions} = this.state;

    torrentContextMenuActions = torrentContextMenuActions.map((setting) => {
      return {
        id: setting.id,
        visible: setting.id === id ? value : setting.visible,
      };
    });

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
            checked={visible}
            onChange={(event) => this.handleCheckboxValueChange(id, (event.target as HTMLInputElement).checked)}>
            <FormattedMessage id="settings.ui.torrent.context.menu.items.show" />
          </Checkbox>
        </span>
      );
    }

    const content = (
      <div className="sortable-list__content sortable-list__content__wrapper">
        <span className="sortable-list__content sortable-list__content--primary">
          <FormattedMessage id={TorrentContextMenuActions[id].id} />
        </span>
        {checkbox}
      </div>
    );

    return content;
  };

  render() {
    const torrentContextMenuActions = Object.keys(TorrentContextMenuActions).map((key) => ({
      id: key,
      visible: this.state.torrentContextMenuActions.some((setting) => setting.id === key && setting.visible),
    }));

    return (
      <SortableList
        id="torrent-context-menu-items"
        className="sortable-list--torrent-context-menu-items"
        items={torrentContextMenuActions}
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
