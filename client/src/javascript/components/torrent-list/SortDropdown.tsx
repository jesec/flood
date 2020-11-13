import {FC} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

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
] as const;

interface SortDropdownProps {
  selectedProperty: TorrentListColumn;
  direction: 'asc' | 'desc';
  onSortChange: (sortBy: FloodSettings['sortTorrents']) => void;
}

const SortDropdown: FC<SortDropdownProps> = (props: SortDropdownProps) => {
  const {direction, selectedProperty, onSortChange} = props;
  const intl = useIntl();

  if (selectedProperty == null) {
    return null;
  }

  const header = (
    <button className="dropdown__button" type="button">
      <label className="dropdown__label">
        <FormattedMessage id="torrents.sort.title" />
      </label>
      <span className="dropdown__value">
        <FormattedMessage id={TorrentListColumns[selectedProperty]?.id || TorrentListColumns.dateAdded.id} />
      </span>
    </button>
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
            {intl.formatMessage(TorrentListColumns[sortProp])}
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

        let nextDirection: 'asc' | 'desc' = 'asc';
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
