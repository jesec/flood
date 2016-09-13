import _ from 'lodash';
import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import EventTypes from '../../../constants/EventTypes';
import UIActions from '../../../actions/UIActions';
import UIStore from '../../../stores/UIStore';

const METHODS_TO_BIND = [
  'closeDropdown',
  'openDropdown',
  'getDropdownButton',
  'getDropdownMenu',
  'getDropdownMenuItems',
  'handleActiveDropdownChange',
  'handleDropdownClick',
  'handleItemSelect',
  'handleKeyPress'
];

class Dropdown extends React.Component {
  constructor() {
    super();

    this.id = _.uniqueId('dropdown_');

    this.state = {
      isOpen: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.handleKeyPress = _.throttle(this.handleKeyPress, 200);
  }

  closeDropdown() {
    global.removeEventListener('keydown', this.handleKeyPress);
    global.removeEventListener('click', this.closeDropdown);
    UIStore.unlisten(EventTypes.UI_DROPDOWN_MENU_CHANGE,
      this.handleActiveDropdownChange);

    this.setState({isOpen: false});
  }

  openDropdown() {
    global.addEventListener('keydown', this.handleKeyPress);
    global.addEventListener('click', this.closeDropdown);
    UIStore.listen(EventTypes.UI_DROPDOWN_MENU_CHANGE,
      this.handleActiveDropdownChange);

    this.setState({isOpen: true});

    if (!!this.props.onOpen) {
      this.props.onOpen();
    }

    UIActions.displayDropdownMenu(this.id);
  }

  handleDropdownClick(event) {
    event.stopPropagation();

    if (this.state.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  handleActiveDropdownChange() {
    if (this.state.isOpen && UIStore.getActiveDropdownMenu() !== this.id) {
      this.closeDropdown();
    }
  }

  handleItemSelect(item) {
    this.closeDropdown();
    this.props.handleItemSelect(item);
  }

  handleKeyPress(event) {
    if (this.state.isOpen && event.keyCode === 27) {
      this.closeDropdown();
    }
  }

  getDropdownButton(options = {}) {
    let label = this.props.header;

    if (options.trigger && !!this.props.trigger) {
      label = this.props.trigger;
    }

    return (
      <div className={this.props.dropdownButtonClass}
        onClick={this.handleDropdownClick}>
        {label}
      </div>
    );
  }

  getDropdownMenu(items) {
    let arrayMethod = this.props.direction === 'up' ? 'unshift' : 'push';
    let content = [
      <div className="dropdown__header" key="dropdown-header">
        {this.getDropdownButton({header: true, trigger: false})}
      </div>
    ];
    let dropdownLists = items.map((itemList, index) => {
      return (
        <div className="dropdown__list" key={index}>
          {this.getDropdownMenuItems(itemList)}
        </div>
      );
    });

    content[arrayMethod](
      <ul className="dropdown__items" key="dropdown-items">
        {dropdownLists}
      </ul>
    );

    return (
      <div className="dropdown__content menu">
        {content}
      </div>
    );
  }

  getDropdownMenuItems(listItems) {
    return listItems.map((property, index) => {
      let classes = classnames('dropdown__item menu__item', property.className, {
        'is-selectable': property.selectable !== false,
        'is-selected': property.selected
      });
      let clickHandler = null;

      if (property.selectable !== false) {
        clickHandler = this.handleItemSelect.bind(this, property);
      }

      return (
        <li className={classes}
          key={index}
          onClick={clickHandler}>
          {property.displayName}
        </li>
      );
    });
  }

  render() {
    let dropdownWrapperClass = classnames(this.props.dropdownWrapperClass,
      `${this.props.dropdownWrapperClass}--direction-${this.props.direction}`,
      {
        [`${this.props.dropdownWrapperClass}--match-button-width`]:
          this.props.matchButtonWidth,
        [`${this.props.dropdownWrapperClass}--width-${this.props.width}`]:
          this.props.width != null,
        [`${this.props.dropdownWrapperClass}--no-wrap`]: this.props.nowrap,
        'is-expanded': this.state.isOpen
      });

    let menu = null;

    if (this.state.isOpen) {
      menu = this.getDropdownMenu(this.props.menuItems);
    }

    return (
      <div className={dropdownWrapperClass}>
        {this.getDropdownButton({header: false, trigger: true})}
        <CSSTransitionGroup
          transitionName="menu"
          transitionEnterTimeout={250}
          transitionLeaveTimeout={250}>
          {menu}
        </CSSTransitionGroup>
      </div>
    );
  }
}

Dropdown.defaultProps = {
  direction: 'down',
  dropdownWrapperClass: 'dropdown',
  dropdownButtonClass: 'dropdown__trigger',
  matchButtonWidth: false,
  noWrap: false
};

Dropdown.propTypes = {
  direction: React.PropTypes.oneOf(['down', 'up']),
  header: React.PropTypes.node,
  trigger: React.PropTypes.node,
  matchButtonWidth: React.PropTypes.bool,
  menuItems: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.object)).isRequired,
  noWrap: React.PropTypes.bool,
  onOpen: React.PropTypes.func,
  width: React.PropTypes.oneOf(['small', 'medium', 'large'])
};

export default Dropdown;
