import classnames from 'classnames';
import {injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import type {FloodSettings} from '@shared/types/FloodSettings';

import Action from './Action';
import Add from '../icons/Add';
import connectStores from '../../util/connectStores';
import MenuIcon from '../icons/MenuIcon';
import Remove from '../icons/Remove';
import SettingsStore from '../../stores/SettingsStore';
import SortDropdown from './SortDropdown';
import StartIcon from '../icons/StartIcon';
import StopIcon from '../icons/StopIcon';
import TorrentActions from '../../actions/TorrentActions';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';

interface ActionBarProps extends WrappedComponentProps {
  sortBy?: FloodSettings['sortTorrents'];
  torrentListViewSize?: FloodSettings['torrentListViewSize'];
}

class ActionBar extends React.Component<ActionBarProps> {
  static handleAddTorrents() {
    UIActions.displayModal({id: 'add-torrents'});
  }

  static handleRemoveTorrents() {
    UIActions.displayModal({
      id: 'remove-torrents',
    });
  }

  static handleSortChange(sortBy: FloodSettings['sortTorrents']) {
    SettingsStore.setFloodSetting('sortTorrents', sortBy);
    UIActions.setTorrentsSort(sortBy);
  }

  static handleStart() {
    TorrentActions.startTorrents({
      hashes: TorrentStore.getSelectedTorrents(),
    });
  }

  static handleStop() {
    TorrentActions.stopTorrents({
      hashes: TorrentStore.getSelectedTorrents(),
    });
  }

  static handleSidebarChange() {
    const view = document.getElementsByClassName('application__view')[0];
    if (view != null) {
      view.classList.toggle('application__view--sidebar-alternative-state');
    }
  }

  render() {
    const classes = classnames('action-bar', {
      'action-bar--is-condensed': this.props.torrentListViewSize === 'condensed',
    });

    return (
      <nav className={classes}>
        <div className="actions action-bar__item action-bar__item--sidebar-expand-collapse">
          <Action
            label="actionbar.button.sidebar.expand.collapse"
            slug="sidebar-expand-collapse"
            icon={<MenuIcon />}
            clickHandler={ActionBar.handleSidebarChange}
            noTip
          />
        </div>
        <div className="actions action-bar__item action-bar__item--sort-torrents">
          <SortDropdown
            direction={this.props.sortBy != null ? this.props.sortBy.direction : 'desc'}
            onSortChange={ActionBar.handleSortChange}
            selectedProperty={this.props.sortBy != null ? this.props.sortBy.property : 'dateAdded'}
          />
        </div>
        <div className="actions action-bar__item action-bar__item--torrent-operations">
          <div className="action-bar__group">
            <Action
              label={this.props.intl.formatMessage({
                id: 'actionbar.button.start.torrent',
              })}
              slug="start-torrent"
              icon={<StartIcon />}
              clickHandler={ActionBar.handleStart}
            />
            <Action
              label={this.props.intl.formatMessage({
                id: 'actionbar.button.stop.torrent',
              })}
              slug="stop-torrent"
              icon={<StopIcon />}
              clickHandler={ActionBar.handleStop}
            />
          </div>
          <div className="action-bar__group action-bar__group--has-divider">
            <Action
              label={this.props.intl.formatMessage({
                id: 'actionbar.button.add.torrent',
              })}
              slug="add-torrent"
              icon={<Add />}
              clickHandler={ActionBar.handleAddTorrents}
            />
            <Action
              label={this.props.intl.formatMessage({
                id: 'actionbar.button.remove.torrent',
              })}
              slug="remove-torrent"
              icon={<Remove />}
              clickHandler={ActionBar.handleRemoveTorrents}
            />
          </div>
        </div>
      </nav>
    );
  }
}

const ConnectedActionBar = connectStores(injectIntl(ActionBar), () => {
  return [
    {
      store: SettingsStore,
      event: 'SETTINGS_CHANGE',
      getValue: ({store}) => {
        const storeSettings = store as typeof SettingsStore;
        return {
          sortBy: storeSettings.getFloodSetting('sortTorrents'),
          torrentListViewSize: storeSettings.getFloodSetting('torrentListViewSize'),
        };
      },
    },
  ];
});

export default ConnectedActionBar;
