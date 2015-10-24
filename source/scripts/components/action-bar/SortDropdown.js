import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import UIActions from '../../actions/UIActions';

const methodsToBind = [
  'componentDidMount',
  'componentWillUnmount',
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
      return (
        <li className="dropdown__content__item" key={index} onClick={this.onItemSelect.bind(this, property)}>
          {property.displayName}
        </li>
      );
    }, this);

    return (
      <ul className="dropdown__content">
        <li className="dropdown__content__header">Sort Torrents</li>
        {menuItems}
      </ul>
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
      isExpanded: false,
      sortBy
    });
    this.props.onSortChange(sortBy);
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
        <a className="dropdown__button" onClick={this.onDropdownClick}>
          <label className="dropdown__label">Sort By</label>
          <span className="dropdown__value">{this.props.selectedItem.displayName}</span>
        </a>
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
