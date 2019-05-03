import {FormattedMessage} from 'react-intl';
import React from 'react';

import EventTypes from '../../constants/EventTypes';
import SidebarFilter from './SidebarFilter';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import UIActions from '../../actions/UIActions';

const METHODS_TO_BIND = ['getFilters', 'handleClick', 'onTrackerFilterChange', 'onTorrentTaxonomyChange'];

export default class TrackerFilters extends React.Component {
  constructor() {
    super();

    this.state = {
      trackerCount: {},
      trackerFilter: TorrentFilterStore.getTrackerFilter(),
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    TorrentFilterStore.listen(EventTypes.CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS, this.onTorrentTaxonomyChange);
    TorrentFilterStore.listen(EventTypes.UI_TORRENTS_FILTER_TRACKER_CHANGE, this.onTrackerFilterChange);
  }

  componentWillUnmount() {
    TorrentFilterStore.unlisten(EventTypes.CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS, this.onTorrentTaxonomyChange);
    TorrentFilterStore.unlisten(EventTypes.UI_TORRENTS_FILTER_TRACKER_CHANGE, this.onTrackerFilterChange);
  }

  getFilters() {
    const filterItems = Object.keys(this.state.trackerCount).sort((a, b) => {
      if (a === 'all') {
        return -1;
      }
      if (b === 'all') {
        return 1;
      }

      return a.localeCompare(b);
    });

    const filterElements = filterItems.map(filter => (
      <SidebarFilter
        handleClick={this.handleClick}
        count={this.state.trackerCount[filter] || 0}
        key={filter}
        isActive={filter === this.state.trackerFilter}
        name={filter}
        slug={filter}
      />
    ));

    return filterElements;
  }

  handleClick(filter) {
    UIActions.setTorrentTrackerFilter(filter);
  }

  hasTrackers() {
    const trackers = Object.keys(this.state.trackerCount);

    return !(trackers.length === 1 && trackers[0] === 'all');
  }

  onTrackerFilterChange() {
    this.setState({trackerFilter: TorrentFilterStore.getTrackerFilter()});
  }

  onTorrentTaxonomyChange() {
    const trackerCount = TorrentFilterStore.getTorrentTrackerCount();
    this.setState({trackerCount});
  }

  render() {
    const filters = this.getFilters();

    if (!this.hasTrackers()) {
      return null;
    }

    return (
      <ul className="sidebar-filter sidebar__item">
        <li className="sidebar-filter__item sidebar-filter__item--heading">
          <FormattedMessage id="filter.tracker.title" defaultMessage="Filter by Tracker" />
        </li>
        {filters}
      </ul>
    );
  }
}
