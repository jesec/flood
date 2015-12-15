import React from 'react';

import ClientStats from './ClientStats';
import StatusFilters from './StatusFilters';
import SearchBox from './SearchBox';

class Sidebar extends React.Component {
  render() {
    return (
      <aside className="sidebar">
        <ClientStats />
        <SearchBox />
        <StatusFilters />
      </aside>
    );
  }
}

export default Sidebar;
