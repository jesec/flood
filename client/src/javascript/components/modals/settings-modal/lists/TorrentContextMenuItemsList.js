import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Checkbox} from '../../../../ui';
import SettingsStore from '../../../../stores/SettingsStore';
import SortableList from '../../../general/SortableList';

import TorrentContextMenuItems from '../../../../constants/TorrentContextMenuItems';

class TorrentContextMenuItemsList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      torrentContextMenuItems: SettingsStore.getFloodSettings('torrentContextMenuItems'),
    };
  }

  updateSettings = (torrentContextMenuItems) => {
    this.props.onSettingsChange({torrentContextMenuItems});
  };

  getLockedIDs() {
    return ['start', 'stop', 'set-taxonomy', 'torrent-details'];
  }

  handleCheckboxValueChange = (id, value) => {
    let {torrentContextMenuItems} = this.state;

    torrentContextMenuItems = torrentContextMenuItems.map((setting) => {
      if (setting.id === id) {
        setting.visible = value;
      }

      return setting;
    });

    this.props.onSettingsChange({torrentContextMenuItems});
    this.setState({torrentContextMenuItems});
  };

  handleMouseDown = () => {
    // do nothing.
  };

  handleMove = () => {
    // do nothing.
  };

  renderItem = (item) => {
    const {id, visible} = item;
    let checkbox = null;

    if (!this.getLockedIDs().includes(id)) {
      checkbox = (
        <span className="sortable-list__content sortable-list__content--secondary">
          <Checkbox
            checked={visible}
            onChange={(event) => this.handleCheckboxValueChange(id, event.target.checked)}
            modifier="dark">
            <FormattedMessage id="settings.ui.torrent.context.menu.items.show" />
          </Checkbox>
        </span>
      );
    }

    const content = (
      <div className="sortable-list__content sortable-list__content__wrapper">
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
    const lockedIDs = this.getLockedIDs();

    return (
      <SortableList
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
