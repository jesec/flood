import {FormattedMessage} from 'react-intl';
import React from 'react';

import connectStores from '../../util/connectStores';
import SidebarFilter from './SidebarFilter';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import UIActions from '../../actions/UIActions';

interface TrackerFiltersProps {
  trackerCount?: Record<string, number>;
  trackerFilter?: string;
}

class TrackerFilters extends React.Component<TrackerFiltersProps> {
  getFilters(): React.ReactNode {
    if (this.props.trackerCount == null) {
      return null;
    }

    const filterItems = Object.keys(this.props.trackerCount).sort((a, b) => {
      if (a === 'all') {
        return -1;
      }
      if (b === 'all') {
        return 1;
      }

      return a.localeCompare(b);
    });

    const filterElements = filterItems.map((filter) => (
      <SidebarFilter
        handleClick={this.handleClick}
        count={(this.props.trackerCount != null && this.props.trackerCount[filter]) || 0}
        key={filter}
        isActive={filter === this.props.trackerFilter}
        name={filter}
        slug={filter}
      />
    ));

    return filterElements;
  }

  handleClick(filter: string): void {
    UIActions.setTorrentTrackerFilter(filter);
  }

  hasTrackers(): boolean {
    if (this.props.trackerCount == null) {
      return false;
    }

    const trackers = Object.keys(this.props.trackerCount);

    return !(trackers.length === 1 && trackers[0] === 'all');
  }

  render(): React.ReactNode {
    const filters = this.getFilters();

    if (!this.hasTrackers()) {
      return null;
    }

    return (
      <ul className="sidebar-filter sidebar__item">
        <li className="sidebar-filter__item sidebar-filter__item--heading">
          <FormattedMessage id="filter.tracker.title" />
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
      event: 'CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS',
      getValue: ({store}) => {
        const storeTorrentFilter = store as typeof TorrentFilterStore;
        return {
          trackerCount: storeTorrentFilter.getTorrentTrackerCount(),
        };
      },
    },
    {
      store: TorrentFilterStore,
      event: 'UI_TORRENTS_FILTER_TRACKER_CHANGE',
      getValue: ({store}) => {
        const storeTorrentFilter = store as typeof TorrentFilterStore;
        return {
          trackerFilter: storeTorrentFilter.getTrackerFilter(),
        };
      },
    },
  ];
});

export default ConnectedTrackerFilters;
