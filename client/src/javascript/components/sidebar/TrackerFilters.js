import {FormattedMessage} from 'react-intl';
import React from 'react';

import connectStores from '../../util/connectStores';
import EventTypes from '../../constants/EventTypes';
import SidebarFilter from './SidebarFilter';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import UIActions from '../../actions/UIActions';

class TrackerFilters extends React.Component {
  getFilters() {
    const filterItems = Object.keys(this.props.trackerCount).sort((a, b) => {
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
        count={this.props.trackerCount[filter] || 0}
        key={filter}
        isActive={filter === this.props.trackerFilter}
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
    const trackers = Object.keys(this.props.trackerCount);

    return !(trackers.length === 1 && trackers[0] === 'all');
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

const ConnectedTrackerFilters = connectStores(TrackerFilters, () => {
  return [
    {
      store: TorrentFilterStore,
      event: EventTypes.CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS,
      getValue: ({store}) => {
        return {
          trackerCount: store.getTorrentTrackerCount(),
        };
      },
    },
    {
      store: TorrentFilterStore,
      event: EventTypes.UI_TORRENTS_FILTER_TRACKER_CHANGE,
      getValue: ({store}) => {
        return {
          trackerFilter: store.getTrackerFilter(),
        };
      },
    },
  ];
});

export default ConnectedTrackerFilters;
