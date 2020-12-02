import {FC, ReactNode} from 'react';
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
import ThemeSwitchButton from './ThemeSwitchButton';
import TrackerFilters from './TrackerFilters';
import TransferData from './TransferData';

const BottomContainer: FC<{children: ReactNode}> = ({children}: {children: ReactNode}) => {
  return (
    <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
      <div style={{flexGrow: 1}} />
      {children}
    </div>
  );
};

const Sidebar: FC = () => {
  return (
    <OverlayScrollbarsComponent
      options={{
        scrollbars: {
          autoHide: 'scroll',
          clickScrolling: false,
          dragScrolling: false,
        },
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
      <BottomContainer>
        <SidebarActions>
          <ThemeSwitchButton />
        </SidebarActions>
      </BottomContainer>
    </OverlayScrollbarsComponent>
  );
};

export default Sidebar;
