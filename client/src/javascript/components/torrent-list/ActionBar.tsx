import classnames from 'classnames';
import {FC} from 'react';
import {observer} from 'mobx-react';
import {useIntl} from 'react-intl';

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

const ActionBar: FC = observer(() => {
  const intl = useIntl();
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
          clickHandler={() => {
            const view = document.getElementsByClassName('application__view')[0];
            if (view != null) {
              view.classList.toggle('application__view--sidebar-alternative-state');
            }
          }}
          noTip
        />
      </div>
      <div className="actions action-bar__item action-bar__item--sort-torrents">
        <SortDropdown
          direction={sortBy != null ? sortBy.direction : 'desc'}
          onSortChange={(newSortBy) => {
            SettingActions.saveSetting('sortTorrents', newSortBy);
          }}
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
            clickHandler={() =>
              TorrentActions.startTorrents({
                hashes: TorrentStore.selectedTorrents,
              })
            }
          />
          <Action
            label={intl.formatMessage({
              id: 'actionbar.button.stop.torrent',
            })}
            slug="stop-torrent"
            icon={<StopIcon />}
            clickHandler={() =>
              TorrentActions.stopTorrents({
                hashes: TorrentStore.selectedTorrents,
              })
            }
          />
        </div>
        <div className="action-bar__group action-bar__group--has-divider">
          <Action
            label={intl.formatMessage({
              id: 'actionbar.button.add.torrent',
            })}
            slug="add-torrent"
            icon={<Add />}
            clickHandler={() => UIActions.displayModal({id: 'add-torrents'})}
          />
          <Action
            label={intl.formatMessage({
              id: 'actionbar.button.remove.torrent',
            })}
            slug="remove-torrent"
            icon={<Remove />}
            clickHandler={() =>
              UIActions.displayModal({
                id: 'remove-torrents',
              })
            }
          />
        </div>
      </div>
    </nav>
  );
});

export default ActionBar;
