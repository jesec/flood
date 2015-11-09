import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import UIActions from '../../actions/UIActions';

const methodsToBind = [
  'componentDidMount',
  'componentWillUnmount',
  'getHeader',
  'getMenu',
  'onItemSelect',
  'onDropdownClick',
  'onExternalClick'
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

  componentDidMount() {
    window.addEventListener('click', this.onExternalClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onExternalClick);
  }

  getHeader() {
    return (
      <a className="dropdown__button" onClick={this.onDropdownClick}>
        <label className="dropdown__label">Sort By</label>
        <span className="dropdown__value">{this.props.selectedItem.displayName}</span>
      </a>
    );
  }

  getMenu() {
    let sortableProperties = [
      {
        displayName: 'Name',
        property: 'name'
      },
      {
        displayName: 'ETA',
        property: 'seconds'
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

    let menuItems = sortableProperties.map(function(property, index) {
      let classes = classnames({
        'dropdown__item': true,
        'is-selected': this.props.selectedItem.property === property.property
      })
      return (
        <li className={classes} key={index} onClick={this.onItemSelect.bind(this, property)}>
          {property.displayName}
        </li>
      );
    }, this);

    return (
      <div className="dropdown__content">
        <div className="dropdown__header">
          {this.getHeader()}
        </div>
        <ul className="dropdown__items">
          {menuItems}
        </ul>
      </div>
    );
  }

  onDropdownClick(event) {
    event.stopPropagation();
    this.setState({
      isExpanded: !this.state.isExpanded
    });
  }

  onExternalClick() {
    if (this.state.isExpanded) {
      this.setState({
        isExpanded: false
      });
    }
  }

  onItemSelect(sortBy) {
    this.setState({
      isExpanded: false
    });
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
    let classes = classnames({
      'dropdown': true,
      'is-expanded': this.state.isExpanded
    });

    let menu = null;

    if (this.state.isExpanded) {
      menu = this.getMenu();
    }

    return (
      <div className={classes}>
        {this.getHeader()}
        <CSSTransitionGroup
          transitionName="dropdown__content"
          transitionEnterTimeout={250}
          transitionLeaveTimeout={250}>
          {menu}
        </CSSTransitionGroup>
      </div>
    );
  }

}
