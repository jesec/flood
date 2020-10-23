import {FormattedMessage} from 'react-intl';
import {observer} from 'mobx-react';
import React from 'react';

import SidebarFilter from './SidebarFilter';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import UIActions from '../../actions/UIActions';

const TagFilters: React.FC = () => {
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
      handleClick={UIActions.setTorrentTagFilter}
      count={TorrentFilterStore.taxonomy.tagCounts[filter] || 0}
      key={filter}
      isActive={filter === TorrentFilterStore.filters.tagFilter}
      name={filter}
      slug={filter}
    />
  ));

  return (
    <ul className="sidebar-filter sidebar__item">
      <li className="sidebar-filter__item sidebar-filter__item--heading">
        <FormattedMessage id="filter.tag.title" />
      </li>
      {filterElements}
    </ul>
  );
};

export default observer(TagFilters);
