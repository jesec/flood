import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import Dropdown from '../forms/Dropdown';

const METHODS_TO_BIND = [
  'getDropdownHeader',
  'handleItemSelect'
];

const SORT_PROPERTIES = [
  {
    displayName: 'Name',
    value: 'name'
  },
  {
    displayName: 'ETA',
    value: 'eta'
  },
  {
    displayName: 'Download Speed',
    value: 'downloadRate'
  },
  {
    displayName: 'Upload Speed',
    value: 'uploadRate'
  },
  {
    displayName: 'Ratio',
    value: 'ratio'
  },
  {
    displayName: 'Percent Complete',
    value: 'percentComplete'
  },
  {
    displayName: 'Downloaded',
    value: 'downloadTotal'
  },
  {
    displayName: 'Uploaded',
    value: 'uploadTotal'
  },
  {
    displayName: 'File Size',
    value: 'sizeBytes'
  },
  {
    displayName: 'Date Added',
    value: 'added'
  }
];

export default class SortDropdown extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getDropdownHeader() {
    return (
      <a className="dropdown__button">
        <label className="dropdown__label">Sort By</label>
        <span className="dropdown__value">{this.props.selectedItem.displayName}</span>
      </a>
    );
  }

  getDropdownMenus() {
    let items = SORT_PROPERTIES.map((sortProp) => {
      return {
        displayName: sortProp.displayName,
        property: 'sortBy',
        selected: this.props.selectedItem.value === sortProp.value,
        value: sortProp.value
      };
    });

    // Dropdown expects an array of arrays.
    return [items];
  }

  handleItemSelect(sortBy) {
    let direction = this.props.selectedItem.direction;

    if (this.props.selectedItem.value === sortBy.value) {
      direction = direction === 'asc' ? 'desc' : 'asc';
    } else {
      direction = 'asc';
    }

    let sortProperty = {
      direction,
      displayName: sortBy.displayName,
      property: 'sortBy',
      value: sortBy.value
    };

    this.props.onSortChange(sortProperty);
  }

  render() {
    if (this.props.selectedItem == null) {
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
