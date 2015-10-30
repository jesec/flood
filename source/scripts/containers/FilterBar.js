import React from 'react';

import ClientStats from '../components/filter-bar/ClientStats';
import { setTorrentsFilter, setTorrentsSearch } from '../actions/UIActions';
import StatusFilters from '../components/filter-bar/StatusFilters';
import SearchBox from '../components/filter-bar/SearchBox';
import UIActions from '../actions/UIActions';

const methodsToBind = [
  'handleFilterChange',
  'handleSearchChange'
];

export default class FilterBar extends React.Component {

  constructor() {
    super();

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleFilterChange(value) {
    this.props.dispatch(setTorrentsFilter(value));
  }

  handleSearchChange(value) {
    this.props.dispatch(setTorrentsSearch(value));
  }

  render() {
    return (
      <nav className="filter-bar">
        <ClientStats />
        <SearchBox handleSearchChange={this.handleSearchChange} />
        <StatusFilters handleFilterChange={this.handleFilterChange}
          activeFilter={this.props.uiStore.torrentList.filterBy} />
      </nav>
    );
  }

}
