import React from 'react';

import ClientStats from './TransferData';
import CustomScrollbars from '../general/CustomScrollbars';
import FeedsButton from './FeedsButton';
import LogoutButton from './LogoutButton';
import NotificationsButton from './NotificationsButton';
import SearchTorrents from './SearchTorrents';
import SettingsButton from './SettingsButton';
import SidebarActions from './SidebarActions';
import SpeedLimitDropdown from './SpeedLimitDropdown';
import StatusFilters from './StatusFilters';
import TagFilters from './TagFilters';
import TrackerFilters from './TrackerFilters';

const Sidebar = () => {
  return (
    <CustomScrollbars className="application__sidebar" inverted>
      <SidebarActions>
        <SpeedLimitDropdown />
        <SettingsButton />
        <FeedsButton />
        <NotificationsButton />
        <LogoutButton />
      </SidebarActions>
      <ClientStats />
      <SearchTorrents />
      <StatusFilters />
      <TagFilters />
      <TrackerFilters />
    </CustomScrollbars>
  );
};

export default Sidebar;
