import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';

import DiskUsage from './DiskUsage';
import FeedsButton from './FeedsButton';
import LogoutButton from './LogoutButton';
import NotificationsButton from './NotificationsButton';
import SearchBox from './SearchBox';
import SettingsButton from './SettingsButton';
import SidebarActions from './SidebarActions';
import SpeedLimitDropdown from './SpeedLimitDropdown';
import StatusFilters from './StatusFilters';
import TagFilters from './TagFilters';
import TrackerFilters from './TrackerFilters';
import TransferData from './TransferData';

const Sidebar = () => {
  return (
    <OverlayScrollbarsComponent
      options={{
        scrollbars: {autoHide: 'scroll', clickScrolling: false, dragScrolling: false},
        className: 'application__sidebar os-theme-thin',
      }}>
      <SidebarActions>
        <SpeedLimitDropdown />
        <SettingsButton />
        <FeedsButton />
        <NotificationsButton />
        <LogoutButton />
      </SidebarActions>
      <TransferData />
      <SearchBox />
      <StatusFilters />
      <TagFilters />
      <TrackerFilters />
      <DiskUsage />
    </OverlayScrollbarsComponent>
  );
};

export default Sidebar;
