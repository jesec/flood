import React from 'react';

import Action from './Action';
import Add from '../Icons/Add';
import EventTypes from '../../constants/EventTypes';
import PauseIcon from '../Icons/PauseIcon';
import Remove from '../Icons/Remove';
import SettingsStore from '../../stores/SettingsStore';
import SortDropdown from './SortDropdown';
import StartIcon from '../Icons/StartIcon';
import StopIcon from '../Icons/StopIcon';
import stringUtil from '../../../../shared/util/stringUtil';
import TorrentActions from '../../actions/TorrentActions';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';

const METHODS_TO_BIND = [
  'handleAddTorrents',
  'handleRemoveTorrents',
  'handleSortChange',
  'handleStart',
  'handleStop',
  'onSortChange'
];

export default class ActionBar extends React.Component {
  constructor() {
    super();

    this.state = {
      sortBy: SettingsStore.getFloodSettings('sortTorrents')
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    this.onSortChange();
    SettingsStore.listen(EventTypes.SETTINGS_CHANGE, this.onSortChange);
  }

  componentWillUnmount() {
    SettingsStore.unlisten(EventTypes.SETTINGS_CHANGE, this.onSortChange);
  }

  handleAddTorrents() {
    UIActions.displayModal({id: 'add-torrents'});
  }

  handleRemoveTorrentConfirm(torrents) {
    TorrentActions.deleteTorrents(torrents);
  }

  handleRemoveTorrents() {
    let selectedTorrents = TorrentStore.getSelectedTorrents() || [];
    let selectedTorrentCount = selectedTorrents.length;

    let actions = [
      {
        clickHandler: this.handleRemoveTorrentDecline,
        content: 'No',
        triggerDismiss: true,
        type: 'secondary'
      },
      {
        clickHandler: this.handleRemoveTorrentConfirm.bind(this, selectedTorrents),
        content: 'Yes',
        triggerDismiss: true,
        type: 'primary'
      }
    ];
    let torrentText = stringUtil.pluralize('torrent', selectedTorrentCount);
    let content = `Are you sure you want to remove ${selectedTorrentCount} ${torrentText}?`;

    if (selectedTorrentCount === 0) {
      actions = [
        {
          clickHandler: null,
          content: 'OK',
          triggerDismiss: true,
          type: 'primary'
        }
      ];
      content = 'You haven\'t selected any torrents.';
    }

    UIActions.displayModal({
      id: 'confirm',
      options: {
        actions,
        content,
        heading: 'Remove Torrents'
      }
    });
  }

  handleSortChange(sortBy) {
    SettingsStore.saveFloodSettings({id: 'sortTorrents', data: sortBy});
    UIActions.setTorrentsSort(sortBy);
  }

  handleStart() {
    TorrentActions.startTorrents(TorrentStore.getSelectedTorrents());
  }

  handleStop() {
    TorrentActions.stopTorrents(TorrentStore.getSelectedTorrents());
  }

  onSortChange() {
    let sortBy = SettingsStore.getFloodSettings('sortTorrents');
    TorrentFilterStore.setTorrentsSort(sortBy);
    this.setState({sortBy});
  }

  render() {
    return (
      <nav className="action-bar">
        <div className="actions action-bar__item action-bar__item--sort-torrents">
          <SortDropdown onSortChange={this.handleSortChange}
            selectedItem={this.state.sortBy} />
        </div>
        <div className="actions action-bar__item action-bar__item--torrent-operations">
          <div className="action-bar__group">
            <Action label="Start Torrent" slug="start-torrent" icon={<StartIcon />}
              clickHandler={this.handleStart} />
            <Action label="Stop Torrent" slug="stop-torrent" icon={<StopIcon />}
              clickHandler={this.handleStop} />
            <Action label="Pause Torrent" slug="pause-torrent" icon={<PauseIcon />}
              clickHandler={this.handlePause} />
          </div>
          <div className="action-bar__group action-bar__group--has-divider">
            <Action label="Add Torrent" slug="add-torrent" icon={<Add />}
              clickHandler={this.handleAddTorrents} />
            <Action label="Remove Torrent" slug="remove-torrent" icon={<Remove />}
              clickHandler={this.handleRemoveTorrents} />
          </div>
        </div>
      </nav>
    );
  }

}
