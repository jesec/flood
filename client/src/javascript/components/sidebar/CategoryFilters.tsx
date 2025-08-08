import {FC, useState} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';

import SidebarFilter from './SidebarFilter';
import Expando from './Expando';
import TorrentFilterStore from '../../stores/TorrentFilterStore';

const CategoryFilters: FC = observer(() => {
  const {i18n} = useLingui();
  const [expanded, setExpanded] = useState<boolean>(true);

  const categories = Object.keys(TorrentFilterStore.taxonomy.categoriesCounts);

  if (
    (categories.length === 1 && categories[0] === '') ||
    (categories.length === 2 && categories[1] === 'uncategorized')
  ) {
    return null;
  }

  const filterItems = categories.slice().sort((a, b) => {
    if (a === '' || a === 'uncategorized') {
      return -1;
    }

    if (b === '' || b === 'uncategorized') {
      return 1;
    }

    return a.localeCompare(b);
  });

  const filterElements = filterItems.map((filter) => (
    <SidebarFilter
      handleClick={(category, event) => TorrentFilterStore.setCategoryFilters(category, event)}
      count={TorrentFilterStore.taxonomy.categoriesCounts[filter] || 0}
      key={filter}
      isActive={
        (filter === '' && !TorrentFilterStore.categoriesFilter.length) ||
        TorrentFilterStore.categoriesFilter.includes(filter)
      }
      name={filter}
      slug={filter}
      size={TorrentFilterStore.taxonomy.categoriesSizes[filter]}
    />
  ));

  const title = i18n._('filter.category.title');

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

export default CategoryFilters;
