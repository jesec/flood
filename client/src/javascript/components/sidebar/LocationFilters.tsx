import {FC, KeyboardEvent, MouseEvent, ReactNode, TouchEvent} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';
import {LocationTreeNode} from '@shared/types/Taxonomy';

import SidebarFilter from './SidebarFilter';
import TorrentFilterStore from '../../stores/TorrentFilterStore';

const LocationFilters: FC = observer(() => {
  const {i18n} = useLingui();

  const locations = Object.keys(TorrentFilterStore.taxonomy.locationCounts);

  if (locations.length === 1 && locations[0] === '') {
    return null;
  }

  const buildLocationFilterTree = (location: LocationTreeNode): ReactNode => {
    if (
      location.children.length === 1 &&
      TorrentFilterStore.taxonomy.locationCounts[location.fullPath] ===
        TorrentFilterStore.taxonomy.locationCounts[location.children[0].fullPath]
    ) {
      const onlyChild = location.children[0];
      const separator = onlyChild.fullPath.includes('/') ? '/' : '\\';
      return buildLocationFilterTree({
        ...onlyChild,
        directoryName: location.directoryName + separator + onlyChild.directoryName,
      });
    }

    const children = location.children.map(buildLocationFilterTree);

    return (
      <SidebarFilter
        handleClick={(filter: string | '', event: KeyboardEvent | MouseEvent | TouchEvent) =>
          TorrentFilterStore.setLocationFilters(filter, event)
        }
        count={TorrentFilterStore.taxonomy.locationCounts[location.fullPath] || 0}
        key={location.fullPath}
        isActive={
          (location.fullPath === '' && !TorrentFilterStore.locationFilter.length) ||
          TorrentFilterStore.locationFilter.includes(location.fullPath)
        }
        name={location.directoryName}
        slug={location.fullPath}
        size={TorrentFilterStore.taxonomy.locationSizes[location.fullPath]}
      >
        {(children.length && children) || undefined}
      </SidebarFilter>
    );
  };

  const filterElements = TorrentFilterStore.taxonomy.locationTree.map(buildLocationFilterTree);

  const title = i18n._('filter.location.title');

  return (
    <ul aria-label={title} className="sidebar-filter sidebar__item" role="menu">
      <li className="sidebar-filter__item sidebar-filter__item--heading" role="none">
        {title}
      </li>
      {filterElements}
    </ul>
  );
});

export default LocationFilters;
