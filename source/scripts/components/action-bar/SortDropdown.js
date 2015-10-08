import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import UIActions from '../../actions/UIActions';

const methodsToBind = [
  'componentDidMount',
  'componentWillUnmount',
  'getMenu',
  '_handleButtonClick',
  '_handleExternalClick',
  '_handleMenuClick'
];

export default class SortDropdown extends React.Component {

  constructor() {
    super();

    this.state = {
      sortBy: {
        displayName: 'Date Added',
        property: 'added',
        direction: 'asc'
      },
      isExpanded: false
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    window.addEventListener('click', this._handleExternalClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._handleExternalClick);
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
        <li className="dropdown__content__item" key={index} onClick={this._handleMenuClick.bind(this, property)}>
          {property.displayName}
        </li>
      );
    }, this);

    return (
      <ul className="dropdown__content" onClick={this._handleMenuWrapperClick}>
        <li className="dropdown__content__header">Sort Torrents</li>
        {menuItems}
      </ul>
    );
  }

  render() {

    let classSet = classnames({
      'dropdown': true,
      'is-expanded': this.state.isExpanded
    });

    let menu = null;

    if (this.state.isExpanded) {
      menu = this.getMenu();
    }

    return (
      <div className={classSet}>
        <a className="dropdown__button" onClick={this._handleButtonClick}>
          <label className="dropdown__label">Sort By</label>
          <span className="dropdown__value">{this.state.sortBy.displayName}</span>
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

  _handleButtonClick(evt) {
    evt.stopPropagation();
    this.setState({
      isExpanded: !this.state.isExpanded
    });
  }

  _handleExternalClick() {
    if (this.state.isExpanded) {
      this.setState({
        isExpanded: false
      });
    }
  }

  _handleMenuClick(property) {
    this.setState({
      isExpanded: false,
      sortBy: {
        displayName: property.displayName,
        property: property.property
      }
    });
    UIActions.sortTorrents(property.property, this.state.sortBy.direction);
  }

  _handleMenuWrapperClick(evt) {
    evt.stopPropagation();
  }

}
