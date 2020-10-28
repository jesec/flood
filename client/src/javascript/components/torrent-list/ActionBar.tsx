import classnames from 'classnames';
import {injectIntl, WrappedComponentProps} from 'react-intl';
import {observer} from 'mobx-react';
import {Component} from 'react';

import type {FloodSettings} from '@shared/types/FloodSettings';

import Action from './Action';
import Add from '../icons/Add';
import MenuIcon from '../icons/MenuIcon';
import Remove from '../icons/Remove';
import SettingActions from '../../actions/SettingActions';
import SettingStore from '../../stores/SettingStore';
import SortDropdown from './SortDropdown';
import StartIcon from '../icons/StartIcon';
import StopIcon from '../icons/StopIcon';
import TorrentActions from '../../actions/TorrentActions';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';

@observer
class ActionBar extends Component<WrappedComponentProps> {
  static handleAddTorrents() {
    UIActions.displayModal({id: 'add-torrents'});
  }

  static handleRemoveTorrents() {
    UIActions.displayModal({
      id: 'remove-torrents',
    });
  }

  static handleSortChange(sortBy: FloodSettings['sortTorrents']) {
    SettingActions.saveSetting('sortTorrents', sortBy);
  }

  static handleStart() {
    TorrentActions.startTorrents({
      hashes: TorrentStore.selectedTorrents,
    });
  }

  static handleStop() {
    TorrentActions.stopTorrents({
      hashes: TorrentStore.selectedTorrents,
    });
  }

  static handleSidebarChange() {
    const view = document.getElementsByClassName('application__view')[0];
    if (view != null) {
      view.classList.toggle('application__view--sidebar-alternative-state');
    }
  }

  render() {
    const {intl} = this.props;
    const {sortTorrents: sortBy, torrentListViewSize} = SettingStore.floodSettings;

    const classes = classnames('action-bar', {
      'action-bar--is-condensed': torrentListViewSize === 'condensed',
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
            direction={sortBy != null ? sortBy.direction : 'desc'}
            onSortChange={ActionBar.handleSortChange}
            selectedProperty={sortBy != null ? sortBy.property : 'dateAdded'}
          />
        </div>
        <div className="actions action-bar__item action-bar__item--torrent-operations">
          <div className="action-bar__group">
            <Action
              label={intl.formatMessage({
                id: 'actionbar.button.start.torrent',
              })}
              slug="start-torrent"
              icon={<StartIcon />}
              clickHandler={ActionBar.handleStart}
            />
            <Action
              label={intl.formatMessage({
                id: 'actionbar.button.stop.torrent',
              })}
              slug="stop-torrent"
              icon={<StopIcon />}
              clickHandler={ActionBar.handleStop}
            />
          </div>
          <div className="action-bar__group action-bar__group--has-divider">
            <Action
              label={intl.formatMessage({
                id: 'actionbar.button.add.torrent',
              })}
              slug="add-torrent"
              icon={<Add />}
              clickHandler={ActionBar.handleAddTorrents}
            />
            <Action
              label={intl.formatMessage({
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

export default injectIntl(ActionBar);
