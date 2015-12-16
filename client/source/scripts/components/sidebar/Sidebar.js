import React from 'react';

import ClientStats from './ClientStats';
import SearchBox from './SearchBox';
import SpeedLimitDropdown from './SpeedLimitDropdown';
import StatusFilters from './StatusFilters';

class Sidebar extends React.Component {
  render() {
    return (
      <aside className="sidebar">
        <SpeedLimitDropdown />
        <ClientStats />
        <SearchBox />
        <StatusFilters />
      </aside>
    );
  }
}

export default Sidebar;
