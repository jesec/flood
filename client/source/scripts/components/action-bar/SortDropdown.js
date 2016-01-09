import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import Dropdown from '../generic/Dropdown';
import UIActions from '../../actions/UIActions';

const METHODS_TO_BIND = [
  'getDropdownHeader',
  'handleItemSelect'
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

  getMenuItems() {
    return [
      [
        {
          displayName: 'Name',
          property: 'sortBy',
          value: 'name'
        },
        {
          displayName: 'ETA',
          property: 'sortBy',
          value: 'eta'
        },
        {
          displayName: 'Download Speed',
          property: 'sortBy',
          value: 'downloadRate'
        },
        {
          displayName: 'Upload Speed',
          property: 'sortBy',
          value: 'uploadRate'
        },
        {
          displayName: 'Ratio',
          property: 'sortBy',
          value: 'ratio'
        },
        {
          displayName: 'Percent Complete',
          property: 'sortBy',
          value: 'percentComplete'
        },
        {
          displayName: 'Downloaded',
          property: 'sortBy',
          value: 'downloadTotal'
        },
        {
          displayName: 'Uploaded',
          property: 'sortBy',
          value: 'uploadTotal'
        },
        {
          displayName: 'File Size',
          property: 'sortBy',
          value: 'sizeBytes'
        },
        {
          displayName: 'Date Added',
          property: 'sortBy',
          value: 'added'
        }
      ]
    ];
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
    return (
      <Dropdown
        handleItemSelect={this.handleItemSelect}
        header={this.getDropdownHeader()}
        menuItems={this.getMenuItems()}
        selectedItem={this.props.selectedItem}
        />
    );
  }
}
