import classnames from 'classnames';
import {injectIntl} from 'react-intl';
import React from 'react';

import Action from './Action';
import Add from '../icons/Add';
import EventTypes from '../../constants/EventTypes';
import Remove from '../icons/Remove';
import SettingsStore from '../../stores/SettingsStore';
import SortDropdown from './SortDropdown';
import StartIcon from '../icons/StartIcon';
import StopIcon from '../icons/StopIcon';
import TorrentActions from '../../actions/TorrentActions';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';

const METHODS_TO_BIND = [
  'handleAddTorrents',
  'handleRemoveTorrents',
  'handleSortChange',
  'handleStart',
  'handleStop',
  'handleSettingsChange',
];

class ActionBar extends React.Component {
  constructor() {
    super();

    this.state = {
      sortBy: SettingsStore.getFloodSettings('sortTorrents'),
      torrentListViewSize: SettingsStore.getFloodSettings('torrentListViewSize'),
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    SettingsStore.listen(EventTypes.SETTINGS_CHANGE, this.handleSettingsChange);
  }

  componentWillUnmount() {
    SettingsStore.unlisten(EventTypes.SETTINGS_CHANGE, this.handleSettingsChange);
  }

  handleAddTorrents() {
    UIActions.displayModal({id: 'add-torrents'});
  }

  handleRemoveTorrents() {
    UIActions.displayModal({
      id: 'remove-torrents',
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
    this.setState({
      sortBy: SettingsStore.getFloodSettings('sortTorrents'),
      torrentListViewSize: SettingsStore.getFloodSettings('torrentListViewSize'),
    });
  }

  render() {
    const classes = classnames('action-bar', {
      'action-bar--is-condensed': this.state.torrentListViewSize === 'condensed',
    });

    return (
      <nav className={classes}>
        <div className="actions action-bar__item action-bar__item--sort-torrents">
          <SortDropdown
            direction={this.state.sortBy.direction}
            onSortChange={this.handleSortChange}
            selectedProperty={this.state.sortBy.property}
          />
        </div>
        <div className="actions action-bar__item action-bar__item--torrent-operations">
          <div className="action-bar__group">
            <Action
              label={this.props.intl.formatMessage({
                id: 'actionbar.button.start.torrent',
                defaultMessage: 'Start Torrent',
              })}
              slug="start-torrent"
              icon={<StartIcon />}
              clickHandler={this.handleStart}
            />
            <Action
              label={this.props.intl.formatMessage({
                id: 'actionbar.button.stop.torrent',
                defaultMessage: 'Stop Torrent',
              })}
              slug="stop-torrent"
              icon={<StopIcon />}
              clickHandler={this.handleStop}
            />
          </div>
          <div className="action-bar__group action-bar__group--has-divider">
            <Action
              label={this.props.intl.formatMessage({
                id: 'actionbar.button.add.torrent',
                defaultMessage: 'Add Torrent',
              })}
              slug="add-torrent"
              icon={<Add />}
              clickHandler={this.handleAddTorrents}
            />
            <Action
              label={this.props.intl.formatMessage({
                id: 'actionbar.button.remove.torrent',
                defaultMessage: 'Remove Torrent',
              })}
              slug="remove-torrent"
              icon={<Remove />}
              clickHandler={this.handleRemoveTorrents}
            />
          </div>
        </div>
      </nav>
    );
  }
}

export default injectIntl(ActionBar);
