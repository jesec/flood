import {FC, KeyboardEvent, MouseEvent, ReactNode, TouchEvent} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';
import {LocationTreeNode} from '@shared/types/Taxonomy';

import SidebarFilter from './SidebarFilter';
import TorrentFilterStore from '../../stores/TorrentFilterStore';

const buildLocationFilterTree = (location: LocationTreeNode): ReactNode => {
  if (location.children.length === 1 && location.containedCount === location.children[0].containedCount) {
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
      count={location.containedCount}
      key={location.fullPath}
      isActive={
        (location.fullPath === '' && !TorrentFilterStore.locationFilter.length) ||
        TorrentFilterStore.locationFilter.includes(location.fullPath)
      }
      name={location.directoryName}
      slug={location.fullPath}
      size={location.containedSize}
    >
      {(children.length && children) || undefined}
    </SidebarFilter>
  );
};

const LocationFilters: FC = observer(() => {
  const {i18n} = useLingui();

  if (TorrentFilterStore.taxonomy.locationTree.containedCount === 0) {
    return null;
  }

  const filterElements = buildLocationFilterTree(TorrentFilterStore.taxonomy.locationTree);

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
