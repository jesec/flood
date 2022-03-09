import {FC, useState} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';

import SidebarFilter from './SidebarFilter';
import Expando from './Expando';
import TorrentFilterStore from '../../stores/TorrentFilterStore';

const TrackerFilters: FC = observer(() => {
  const {i18n} = useLingui();
  const [expanded, setExpanded] = useState<boolean>(true);

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
      handleClick={(tracker, event) => TorrentFilterStore.setTrackerFilters(tracker, event)}
      count={TorrentFilterStore.taxonomy.trackerCounts[filter] || 0}
      key={filter}
      isActive={
        (filter === '' && !TorrentFilterStore.trackerFilter.length) || TorrentFilterStore.trackerFilter.includes(filter)
      }
      name={filter}
      slug={filter}
      size={TorrentFilterStore.taxonomy.trackerSizes[filter]}
    />
  ));

  const title = i18n._('filter.tracker.title');

  const expandoClick = () => {
    setExpanded(!expanded);
  };

  return (
    <ul aria-label={title} className="sidebar-filter sidebar__item" role="menu">
      <li className="sidebar-filter__item" role="none">
        <Expando className="sidebar-filter__item--heading" expanded={expanded} handleClick={expandoClick}>
          {title}
        </Expando>
      </li>
      {expanded && filterElements}
    </ul>
  );
});

export default TrackerFilters;
