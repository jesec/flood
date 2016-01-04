import _ from 'lodash';
import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

const methodsToBind = [
  'getDropdownButton',
  'getDropdownMenu',
  'getDropdownMenuItems',
  'handleDropdownBlur',
  'handleDropdownClick',
  'handleDropdownFocus',
  'handleItemSelect'
];

export default class Dropdown extends React.Component {
  constructor() {
    super();

    this.state = {
      isExpanded: false
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleDropdownBlur() {
    this.setState({
      isExpanded: false
    });
  }

  handleDropdownClick() {
    if (this.state.isExpanded) {
      this.refs.dropdown.blur();
    } else {
      this.refs.dropdown.focus();
    }
  }

  handleDropdownFocus(event) {
    this.setState({
      isExpanded: true
    });
  }

  handleItemSelect(item) {
    this.refs.dropdown.blur();
    this.props.handleItemSelect(item);
  }

  getDropdownButton() {
    return (
      <div className={this.props.dropdownButtonClass} onClick={this.handleDropdownClick}>
        {this.props.header}
      </div>
    );
  }

  getDropdownMenu(items) {
    let dropdownLists = items.map(function(itemList, index) {
      return (
        <div className="dropdown__list" key={index}>
          {this.getDropdownMenuItems(itemList)}
        </div>
      );
    }, this);

    return (
      <div className="dropdown__content">
        <div className="dropdown__header">
          {this.getDropdownButton()}
        </div>
        <ul className="dropdown__items">
          {dropdownLists}
        </ul>
      </div>
    );
  }

  getDropdownMenuItems(listItems) {
    return listItems.map(function(property, index) {
      let classes = classnames({
        'dropdown__item': true,
        'is-selected': this.props.selectedItem.property === property.property &&
          this.props.selectedItem.value === property.value
      })
      return (
        <li className={classes} key={index} onClick={this.handleItemSelect.bind(this, property)}>
          {property.displayName}
        </li>
      );
    }, this);
  }

  render() {
    let dropdownWrapperClass = classnames({
      [this.props.dropdownWrapperClass]: true,
      'is-expanded': this.state.isExpanded
    });

    let menu = null;

    if (this.state.isExpanded) {
      menu = this.getDropdownMenu(this.props.menuItems);
    }

    return (
      <div className={dropdownWrapperClass} onFocus={this.handleDropdownFocus} onBlur={this.handleDropdownBlur} ref="dropdown" tabIndex="0">
        {this.getDropdownButton()}
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

Dropdown.defaultProps = {
  dropdownWrapperClass: 'dropdown',
  dropdownButtonClass: 'dropdown__trigger'
};

Dropdown.propTypes = {
  menuItems: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.object)).isRequired
};
