import {FC} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';

import SidebarFilter from './SidebarFilter';
import TorrentFilterStore from '../../stores/TorrentFilterStore';

const TagFilters: FC = observer(() => {
  const {i18n} = useLingui();

  const tags = Object.keys(TorrentFilterStore.taxonomy.tagCounts);

  if ((tags.length === 1 && tags[0] === '') || (tags.length === 2 && tags[1] === 'untagged')) {
    return null;
  }

  const filterItems = tags.slice().sort((a, b) => {
    if (a === '' || a === 'untagged') {
      return -1;
    }

    if (b === '' || b === 'untagged') {
      return 1;
    }

    return a.localeCompare(b);
  });

  const filterElements = filterItems.map((filter) => (
    <SidebarFilter
      handleClick={(tag, event) => TorrentFilterStore.setTagFilters(tag, event)}
      count={TorrentFilterStore.taxonomy.tagCounts[filter] || 0}
      key={filter}
      isActive={
        (filter === '' && !TorrentFilterStore.filters.tagFilter.length) ||
        TorrentFilterStore.filters.tagFilter.includes(filter)
      }
      name={filter}
      slug={filter}
      size={TorrentFilterStore.taxonomy.tagSizes[filter]}
    />
  ));

  const title = i18n._('filter.tag.title');

  return (
    <ul aria-label={title} className="sidebar-filter sidebar__item" role="menu">
      <li className="sidebar-filter__item sidebar-filter__item--heading" role="none">
        {title}
      </li>
      {filterElements}
    </ul>
  );
});

export default TagFilters;
