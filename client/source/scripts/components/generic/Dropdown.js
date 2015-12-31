import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

const methodsToBind = [
  'getDropdownButton',
  'getDropdownMenu',
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

  getDropdownMenu() {
    let menuItems = this.props.menuItems.map(function(property, index) {
      let classes = classnames({
        'dropdown__item': true,
        'is-selected': this.props.selectedItem.property === property.property
      })
      return (
        <li className={classes} key={index} onClick={this.handleItemSelect.bind(this, property)}>
          {property.displayName}
        </li>
      );
    }, this);

    return (
      <div className="dropdown__content">
        <div className="dropdown__header">
          {this.getDropdownButton()}
        </div>
        <ul className="dropdown__items">
          {menuItems}
        </ul>
      </div>
    );
  }

  render() {
    let dropdownWrapperClass = classnames({
      [this.props.dropdownWrapperClass]: true,
      'is-expanded': this.state.isExpanded
    });

    let menu = null;

    if (this.state.isExpanded) {
      menu = this.getDropdownMenu();
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
