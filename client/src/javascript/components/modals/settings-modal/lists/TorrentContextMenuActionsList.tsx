import React from 'react';
import {FormattedMessage} from 'react-intl';

import type {FloodSettings} from '@shared/types/FloodSettings';

import {Checkbox} from '../../../../ui';
import ErrorIcon from '../../../icons/ErrorIcon';
import SettingsStore from '../../../../stores/SettingsStore';
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

class TorrentContextMenuActionsList extends React.Component<
  TorrentContextMenuActionsListProps,
  TorrentContextMenuActionsListStates
> {
  tooltipRef: Tooltip | null = null;

  constructor(props: TorrentContextMenuActionsListProps) {
    super(props);

    this.state = {
      torrentContextMenuActions: SettingsStore.getFloodSetting('torrentContextMenuActions'),
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

    if (id === 'setTracker') {
      const tooltipContent = <FormattedMessage id={TorrentContextMenuActions[id].warning} />;

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
          <FormattedMessage id={TorrentContextMenuActions[id].id} />
        </span>
        {checkbox}
      </div>
    );

    return content;
  };

  render() {
    const {torrentContextMenuActions} = this.state;

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
