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

  componentDidMount() {
    UIStore.listen(EventTypes.UI_DROPDOWN_MENU_CHANGE,
      this.handleActiveDropdownChange);
  }

  componentWillUnmount() {
    UIStore.unlisten(EventTypes.UI_DROPDOWN_MENU_CHANGE,
      this.handleActiveDropdownChange);
  }

  closeDropdown() {
    global.removeEventListener('keydown', this.handleKeyPress);

    this.setState({isOpen: false});
  }

  openDropdown() {
    global.addEventListener('keydown', this.handleKeyPress);

    this.setState({isOpen: true});

    if (!!this.props.onOpen) {
      this.props.onOpen();
    }

    UIActions.displayDropdownMenu(this.id);
  }

  handleDropdownClick(event) {
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
    let dropdownLists = items.map((itemList, index) => {
      return (
        <div className="dropdown__list" key={index}>
          {this.getDropdownMenuItems(itemList)}
        </div>
      );
    });

    return (
      <div className="dropdown__content menu">
        <div className="dropdown__header">
          {this.getDropdownButton({header: true, trigger: false})}
        </div>
        <ul className="dropdown__items">
          {dropdownLists}
        </ul>
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
    let dropdownWrapperClass = classnames(this.props.dropdownWrapperClass, {
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
  dropdownWrapperClass: 'dropdown',
  dropdownButtonClass: 'dropdown__trigger'
};

Dropdown.propTypes = {
  header: React.PropTypes.node,
  trigger: React.PropTypes.node,
  menuItems: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.object)).isRequired,
  onOpen: React.PropTypes.func
};

export default Dropdown;
