import {FC} from 'react';
import {Trans, useLingui} from '@lingui/react';

import SortDirections from '@client/constants/SortDirections';

import type {FloodSettings} from '@shared/types/FloodSettings';

import Dropdown from '../general/form-elements/Dropdown';
import TorrentListColumns from '../../constants/TorrentListColumns';

import type {TorrentListColumn} from '../../constants/TorrentListColumns';

const SORT_PROPERTIES = [
  'name',
  'eta',
  'downRate',
  'upRate',
  'ratio',
  'percentComplete',
  'downTotal',
  'upTotal',
  'sizeBytes',
  'dateAdded',
  'dateFinished',
] as const;

interface SortDropdownProps {
  selectedProperty: TorrentListColumn;
  direction: 'asc' | 'desc';
  onSortChange: (sortBy: FloodSettings['sortTorrents']) => void;
}

const SortDropdown: FC<SortDropdownProps> = (props: SortDropdownProps) => {
  const {direction, selectedProperty, onSortChange} = props;
  const {i18n} = useLingui();

  if (selectedProperty == null) {
    return null;
  }

  const header = (
    <div className="dropdown__button">
      <span className="dropdown__label">
        <Trans id="torrents.sort.title" />
      </span>
      <span className="dropdown__value">
        <Trans id={TorrentListColumns[selectedProperty]} />
      </span>
    </div>
  );

  const menuItems = [
    SORT_PROPERTIES.map((sortProp) => {
      const isSelected = sortProp === selectedProperty;
      const directionIndicator = isSelected ? (
        <span className={`sort-dropdown__indicator sort-dropdown__indicator--${direction}`} />
      ) : null;

      return {
        displayName: (
          <div className="sort-dropdown__item">
            {i18n._(TorrentListColumns[sortProp])}
            {directionIndicator}
          </div>
        ),
        selected: isSelected,
        property: sortProp,
      };
    }),
  ];

  return (
    <Dropdown
      handleItemSelect={(selection) => {
        const {property} = selection;

        if (property == null) {
          return;
        }

        let nextDirection: 'asc' | 'desc' = SortDirections[property] ?? 'asc';
        if (selectedProperty === property) {
          nextDirection = direction === 'asc' ? 'desc' : 'asc';
        }

        onSortChange({direction: nextDirection, property});
      }}
      header={header}
      menuItems={menuItems}
    />
  );
};

export default SortDropdown;
