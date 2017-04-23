import {FormattedMessage} from 'react-intl';
import React from 'react';

import ClientStats from './TransferData';
import CustomScrollbars from '../general/CustomScrollbars';
import EventTypes from '../../constants/EventTypes';
import FeedsButton from './FeedsButton';
import NotificationsButton from './NotificationsButton';
import SearchTorrents from './SearchTorrents';
import SettingsButton from './SettingsButton';
import SidebarActions from './SidebarActions';
import SpeedLimitDropdown from './SpeedLimitDropdown';
import StatusFilters from './StatusFilters';
import TagFilters from './TagFilters';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import TorrentStore from '../../stores/TorrentStore';
import TrackerFilters from './TrackerFilters';
import UIStore from '../../stores/UIStore';

class Sidebar extends React.Component {
  constructor() {
    super();

    UIStore.registerDependency({
      id: 'torrent-taxonomy',
      message: (
        <FormattedMessage id="dependency.loading.torrent.taxonomy"
          defaultMessage="Torrent Taxonomy" />
      ),
    });
  }

  componentDidMount() {
    TorrentStore.listen(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS,
      this.onTorrentRequestSuccess);
    TorrentFilterStore.listen(EventTypes.CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS,
      this.onTorrentTaxonomyRequestSuccess);
  }

  componentWillUnmount() {
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS,
      this.onTorrentRequestSuccess);
    TorrentFilterStore.unlisten(EventTypes.CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS,
      this.onTorrentTaxonomyRequestSuccess);
  }

  onTorrentTaxonomyRequestSuccess() {
    UIStore.satisfyDependency('torrent-taxonomy');
  }

  onTorrentRequestSuccess() {
    TorrentFilterStore.fetchTorrentTaxonomy();
  }

  render() {
    return (
      <CustomScrollbars className="application__sidebar" inverted={true}>
        <SidebarActions>
          <SpeedLimitDropdown />
          <SettingsButton />
          <FeedsButton />
          <NotificationsButton />
        </SidebarActions>
        <ClientStats />
        <SearchTorrents />
        <StatusFilters />
        <TagFilters />
        <TrackerFilters />
      </CustomScrollbars>
    );
  }
}

export default Sidebar;
