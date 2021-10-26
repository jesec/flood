import {FC} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';

import SidebarFilter from './SidebarFilter';
import TorrentFilterStore from '../../stores/TorrentFilterStore';

const TrackerFilters: FC = observer(() => {
  const {i18n} = useLingui();

  const trackers = Object.keys(TorrentFilterStore.taxonomy.trackerCounts);

  if (trackers.length === 1 && trackers[0] === '') {
    return null;
  }

  const filterItems = trackers.slice().sort((a, b) => {
    if (a === '') {
      return -1;
    }
    if (b === '') {
      return 1;
    }

    return a.localeCompare(b);
  });

  const filterElements = filterItems.map((filter) => (
    <SidebarFilter
      handleClick={TorrentFilterStore.setTrackerFilter}
      count={TorrentFilterStore.taxonomy.trackerCounts[filter] || 0}
      key={filter}
      isActive={filter === TorrentFilterStore.filters.trackerFilter}
      name={filter}
      slug={filter}
      size={TorrentFilterStore.taxonomy.trackerSizes[filter]}
    />
  ));

  const title = i18n._('filter.tracker.title');

  return (
    <ul aria-label={title} className="sidebar-filter sidebar__item" role="menu">
      <li className="sidebar-filter__item sidebar-filter__item--heading" role="none">
        {title}
      </li>
      {filterElements}
    </ul>
  );
});

export default TrackerFilters;
