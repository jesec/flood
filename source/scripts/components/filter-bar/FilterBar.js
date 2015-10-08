import React from 'react';

import ClientStats from './ClientStats';
import StatusFilter from './StatusFilter';
import SearchBox from './SearchBox';
import UIActions from '../../actions/UIActions';

export default class FilterBar extends React.Component {

  constructor() {
    super();
  }

  render() {
    return (
      <nav className="filter-bar">
        <ClientStats />
        <SearchBox searchChangeHandler={this._onSearchChange} />
        <StatusFilter />
      </nav>
    );
  }

  _onSearchChange(value) {
    UIActions.searchTorrents(value);
  }

}
