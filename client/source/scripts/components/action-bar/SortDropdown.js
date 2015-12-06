import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import Dropdown from '../generic/Dropdown';
import UIActions from '../../actions/UIActions';

const methodsToBind = [
  'getDropdownHeader',
  'handleItemSelect'
];

export default class SortDropdown extends React.Component {

  constructor() {
    super();

    this.state = {
      isExpanded: false
    };

    methodsToBind.forEach((method) => {
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
      {
        displayName: 'Name',
        property: 'name'
      },
      {
        displayName: 'ETA',
        property: 'eta'
      },
      {
        displayName: 'Download Speed',
        property: 'downloadRate'
      },
      {
        displayName: 'Upload Speed',
        property: 'uploadRate'
      },
      {
        displayName: 'Ratio',
        property: 'ratio'
      },
      {
        displayName: 'Percent Complete',
        property: 'percentComplete'
      },
      {
        displayName: 'Downloaded',
        property: 'downloadTotal'
      },
      {
        displayName: 'Uploaded',
        property: 'uploadTotal'
      },
      {
        displayName: 'File Size',
        property: 'sizeBytes'
      },
      {
        displayName: 'Date Added',
        property: 'added'
      }
    ];

  }

  handleItemSelect(sortBy) {
    console.log(sortBy);
    let direction = this.props.selectedItem.direction;

    if (this.props.selectedItem.property === sortBy.property) {
      direction = direction === 'asc' ? 'desc' : 'asc';
    } else {
      direction = 'asc';
    }

    let sortProperty = {
      displayName: sortBy.displayName,
      property: sortBy.property,
      direction
    };

    this.props.onSortChange(sortProperty);
  }

  render() {
    return (
      <Dropdown
        handleItemSelect={this.handleItemSelect}
        header={this.getDropdownHeader}
        menuItems={this.getMenuItems()}
        selectedItem={this.props.selectedItem}
        />
    );
  }

}
