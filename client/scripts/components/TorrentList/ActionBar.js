import {formatMessage, injectIntl} from 'react-intl';
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
  'handleSettingsChange'
];

class ActionBar extends React.Component {
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
    SettingsStore.listen(EventTypes.SETTINGS_CHANGE, this.handleSettingsChange);
  }

  componentWillUnmount() {
    SettingsStore.unlisten(EventTypes.SETTINGS_CHANGE,
      this.handleSettingsChange);
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
        content: this.props.intl.formatMessage({
          id: 'button.no',
          defaultMessage: 'No'
        }),
        triggerDismiss: true,
        type: 'secondary'
      },
      {
        clickHandler: this.handleRemoveTorrentConfirm.bind(this, selectedTorrents),
        content: this.props.intl.formatMessage({
          id: 'button.yes',
          defaultMessage: 'Yes'
        }),
        triggerDismiss: true,
        type: 'primary'
      }
    ];

    let content = this.props.intl.formatMessage({
      id: 'torrents.remove.are.you.sure',
      defaultMessage: `Are you sure you want to remove {count, plural,
        =0 {no torrents}
        =1 {one torrent}
        other {# torrents}
      }?`
    }, {
      count: selectedTorrentCount
    });

    if (selectedTorrentCount === 0) {
      actions = [
        {
          clickHandler: null,
          content: 'OK',
          triggerDismiss: true,
          type: 'primary'
        }
      ];
      content = this.props.intl.formatMessage({
        id: 'torrents.remove.error.no.torrents.selected',
        defaultMessage: 'You haven\'t selected any torrents.'
      });
    }

    UIActions.displayModal({
      id: 'confirm',
      options: {
        actions,
        content,
        heading: this.props.intl.formatMessage({
          id: 'torrents.remove',
          defaultMessage: 'Remove Torrents'
        })
      }
    });
  }

  handleSortChange(sortBy) {
    this.setState({sortBy});
    SettingsStore.saveFloodSettings({id: 'sortTorrents', data: sortBy});
    UIActions.setTorrentsSort(sortBy);
  }

  handleStart() {
    TorrentActions.startTorrents(TorrentStore.getSelectedTorrents());
  }

  handleStop() {
    TorrentActions.stopTorrents(TorrentStore.getSelectedTorrents());
  }

  handleSettingsChange() {
    let sortBy = SettingsStore.getFloodSettings('sortTorrents');
    this.setState({sortBy});
  }

  render() {
    return (
      <nav className="action-bar">
        <div className="actions action-bar__item action-bar__item--sort-torrents">
          <SortDropdown direction={this.state.sortBy.direction}
            onSortChange={this.handleSortChange}
            selectedProperty={this.state.sortBy.property} />
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

export default injectIntl(ActionBar);
