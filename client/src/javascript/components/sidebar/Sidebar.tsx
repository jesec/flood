import React from 'react';

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
import TransferData from './TransferData';
import DiskUsage from './DiskUsage';

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
      <TransferData />
      <SearchTorrents />
      <StatusFilters />
      <TagFilters />
      <TrackerFilters />
      <DiskUsage />
    </CustomScrollbars>
  );
};

export default Sidebar;
