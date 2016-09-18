import {FormattedMessage} from 'react-intl';
import React from 'react';

import ClientStats from '../Sidebar/TransferData';
import CustomScrollbars from '../General/CustomScrollbars';
import EventTypes from '../../constants/EventTypes';
import FeedsButton from '../Sidebar/FeedsButton';
import SearchTorrents from '../Sidebar/SearchTorrents';
import SettingsButton from '../Sidebar/SettingsButton';
import SidebarActions from '../Sidebar/SidebarActions';
import SpeedLimitDropdown from '../Sidebar/SpeedLimitDropdown';
import StatusFilters from '../Sidebar/StatusFilters';
import TagFilters from '../Sidebar/TagFilters';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import TorrentStore from '../../stores/TorrentStore';
import TrackerFilters from '../Sidebar/TrackerFilters';
import UIStore from '../../stores/UIStore';

class Sidebar extends React.Component {
  componentDidMount() {
    UIStore.registerDependency({
      id: 'torrent-taxonomy',
      message: (
        <FormattedMessage id="dependency.loading.torrent.taxonomy"
          defaultMessage="Torrent Taxonomy" />
      ),
    });
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
