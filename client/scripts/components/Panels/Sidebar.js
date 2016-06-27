import React from 'react';

import ClientStats from '../Sidebar/TransferData';
import CustomScrollbars from '../General/CustomScrollbars';
import SearchBox from '../General/FormElements/SearchBox';
import SettingsButton from '../Sidebar/SettingsButton';
import SpeedLimitDropdown from '../Sidebar/SpeedLimitDropdown';
import StatusFilters from '../Sidebar/StatusFilters';
import TrackerFilters from '../Sidebar/TrackerFilters';

class Sidebar extends React.Component {
  render() {
    return (
      <CustomScrollbars className="application__sidebar" inverted={true}>
        <SettingsButton />
        <SpeedLimitDropdown />
        <ClientStats />
        <SearchBox />
        <StatusFilters />
        <TrackerFilters />
      </CustomScrollbars>
    );
  }
}

export default Sidebar;
