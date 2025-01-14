import {FC} from 'react';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';

import DiskUsage from './DiskUsage';
import FeedsButton from './FeedsButton';
import LogoutButton from './LogoutButton';
import LocationFilters from './LocationFilters';
import NotificationsButton from './NotificationsButton';
import SearchBox from './SearchBox';
import SettingsButton from './SettingsButton';
import SidebarActions from './SidebarActions';
import SpeedLimitDropdown from './SpeedLimitDropdown';
import StatusFilters from './StatusFilters';
import TagFilters from './TagFilters';
import ThemeSwitchButton from './ThemeSwitchButton';
import TrackerFilters from './TrackerFilters';
import TransferData from './TransferData';

const Sidebar: FC = () => (
  <OverlayScrollbarsComponent
    className="application__sidebar"
    options={{
      scrollbars: {
        autoHide: 'scroll',
        clickScroll: false,
        dragScroll: false,
        theme: `os-theme-thin`,
      },
      overflow: {
        x: 'hidden',
        y: 'scroll',
      },
    }}
  >
    <div style={{display: 'flex', flexDirection: 'column'}}>
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
      <LocationFilters />
      <DiskUsage />
      <div style={{flexGrow: 1}} />
      <SidebarActions>
        <ThemeSwitchButton />
      </SidebarActions>
    </div>
  </OverlayScrollbarsComponent>
);

export default Sidebar;
