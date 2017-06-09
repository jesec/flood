import {formatMessage, FormattedMessage, injectIntl} from 'react-intl';
import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import Dropdown from '../general/form-elements/Dropdown';
import TorrentProperties from '../../constants/TorrentProperties';

const METHODS_TO_BIND = ['getDropdownHeader', 'handleItemSelect'];
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
  'dateAdded'
];

class SortDropdown extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getDropdownHeader() {
    const {selectedProperty} = this.props;
    let propertyMessageConfig = TorrentProperties[selectedProperty];

    if (propertyMessageConfig == null) {
      propertyMessageConfig = TorrentProperties.dateAdded;
    }

    return (
      <a className="dropdown__button">
        <label className="dropdown__label">
          <FormattedMessage
            id="torrents.sort.title"
            defaultMessage="Sort By"
          />
        </label>
        <span className="dropdown__value">
          <FormattedMessage
            id={propertyMessageConfig.id}
            defaultMessage={propertyMessageConfig.defaultMessage}
          />
        </span>
      </a>
    );
  }

  getDropdownMenus() {
    const {direction, selectedProperty} = this.props;
    let items = SORT_PROPERTIES.map((sortProp) => {
      const isSelected = sortProp === this.props.selectedProperty;
      const directionIndicator = isSelected ? (
          <span className={`sort-dropdown__indicator sort-dropdown__indicator--${direction}`} />
        ) : null;

      return {
        displayName: (
          <div className="sort-dropdown__item">
            {this.props.intl.formatMessage(TorrentProperties[sortProp])}
            {directionIndicator}
          </div>
        ),
        selected: isSelected,
        property: sortProp
      };
    });

    // Dropdown expects an array of arrays.
    return [items];
  }

  handleItemSelect(selection) {
    let {direction} = this.props;
    let {property} = selection;

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
        menuItems={this.getDropdownMenus()} />
    );
  }
}

export default injectIntl(SortDropdown);
