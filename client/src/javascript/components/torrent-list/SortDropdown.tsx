import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import {PureComponent} from 'react';

import type {FloodSettings} from '@shared/types/FloodSettings';

import Dropdown from '../general/form-elements/Dropdown';
import TorrentListColumns from '../../constants/TorrentListColumns';

import type {DropdownItem} from '../general/form-elements/Dropdown';
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

interface SortDropdownProps extends WrappedComponentProps {
  selectedProperty: TorrentListColumn;
  direction: 'asc' | 'desc';
  onSortChange: (sortBy: FloodSettings['sortTorrents']) => void;
}

class SortDropdown extends PureComponent<SortDropdownProps> {
  constructor(props: SortDropdownProps) {
    super(props);

    this.getDropdownHeader = this.getDropdownHeader.bind(this);
    this.handleItemSelect = this.handleItemSelect.bind(this);
  }

  getDropdownHeader() {
    const {selectedProperty} = this.props;
    let propertyMessageConfig = TorrentListColumns[selectedProperty];

    if (propertyMessageConfig == null) {
      propertyMessageConfig = TorrentListColumns.dateAdded;
    }

    return (
      <button className="dropdown__button" type="button">
        <label className="dropdown__label">
          <FormattedMessage id="torrents.sort.title" />
        </label>
        <span className="dropdown__value">
          <FormattedMessage id={propertyMessageConfig.id} />
        </span>
      </button>
    );
  }

  getDropdownMenus() {
    const {direction, selectedProperty, intl} = this.props;
    const items = SORT_PROPERTIES.map((sortProp) => {
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
    });

    // Dropdown expects an array of arrays.
    return [items];
  }

  handleItemSelect(selection: DropdownItem<typeof SORT_PROPERTIES[number]>) {
    let {direction} = this.props;
    const {property} = selection;

    if (property == null) {
      return;
    }

    if (this.props.selectedProperty === property) {
      direction = direction === 'asc' ? 'desc' : 'asc';
    } else {
      direction = 'asc';
    }

    this.props.onSortChange({direction, property});
  }

  render() {
    if (this.props.selectedProperty == null) {
      return null;
    }

    return (
      <Dropdown
        handleItemSelect={this.handleItemSelect}
        header={this.getDropdownHeader()}
        menuItems={this.getDropdownMenus()}
      />
    );
  }
}

export default injectIntl(SortDropdown);
