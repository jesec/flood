import React from 'react';

import ApplicationSidebar from '../layout/ApplicationSidebar';
import ClientStats from '../sidebar/TransferData';
import SearchBox from '../forms/SearchBox';
import SpeedLimitDropdown from '../sidebar/SpeedLimitDropdown';
import StatusFilters from '../sidebar/StatusFilters';

class Sidebar extends React.Component {
  render() {
    return (
      <ApplicationSidebar>
        <SpeedLimitDropdown />
        <ClientStats />
        <SearchBox />
        <StatusFilters />
      </ApplicationSidebar>
    );
  }
}

export default Sidebar;
