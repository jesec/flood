import _ from 'lodash';
import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import PropTypes from 'prop-types';
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
  'handleKeyPress',
];

class Dropdown extends React.Component {
  static propTypes = {
    direction: PropTypes.oneOf(['down', 'up']),
    header: PropTypes.node,
    trigger: PropTypes.node,
    matchButtonWidth: PropTypes.bool,
    menuItems: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)).isRequired,
    noWrap: PropTypes.bool,
    onOpen: PropTypes.func,
    width: PropTypes.oneOf(['small', 'medium', 'large']),
  };

  static defaultProps = {
    baseClassName: 'dropdown',
    direction: 'down',
    dropdownWrapperClass: 'dropdown',
    dropdownButtonClass: 'dropdown__trigger',
    matchButtonWidth: false,
    noWrap: false,
  };

  constructor() {
    super();

    this.id = _.uniqueId('dropdown_');

    this.state = {
      isOpen: false,
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.handleKeyPress = _.throttle(this.handleKeyPress, 200);
  }

  closeDropdown() {
    global.removeEventListener('keydown', this.handleKeyPress);
    global.removeEventListener('click', this.closeDropdown);
    UIStore.unlisten(EventTypes.UI_DROPDOWN_MENU_CHANGE, this.handleActiveDropdownChange);

    this.setState({isOpen: false});
  }

  openDropdown() {
    global.addEventListener('keydown', this.handleKeyPress);
    global.addEventListener('click', this.closeDropdown);
    UIStore.listen(EventTypes.UI_DROPDOWN_MENU_CHANGE, this.handleActiveDropdownChange);

    this.setState({isOpen: true});

    if (this.props.onOpen) {
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
      <div className={this.props.dropdownButtonClass} onClick={this.handleDropdownClick}>
        {label}
      </div>
    );
  }

  getDropdownMenu(items) {
    // TODO: Rewrite this function, wtf was I thinking
    const arrayMethod = this.props.direction === 'up' ? 'unshift' : 'push';
    const content = [
      <div className="dropdown__header" key="dropdown-header">
        {this.getDropdownButton({header: true, trigger: false})}
      </div>,
    ];
    const dropdownLists = items.map((itemList, index) => (
      // TODO: Find a better key
      // eslint-disable-next-line react/no-array-index-key
      <div className="dropdown__list" key={index}>
        {this.getDropdownMenuItems(itemList)}
      </div>
    ));

    content[arrayMethod](
      <ul className="dropdown__items" key="dropdown-items">
        {dropdownLists}
      </ul>,
    );

    return <div className="dropdown__content menu">{content}</div>;
  }

  getDropdownMenuItems(listItems) {
    return listItems.map((property, index) => {
      const classes = classnames('dropdown__item menu__item', property.className, {
        'is-selectable': property.selectable !== false,
        'is-selected': property.selected,
      });
      let clickHandler = null;

      if (property.selectable !== false) {
        clickHandler = this.handleItemSelect.bind(this, property);
      }

      return (
        // TODO: Find a better key
        // eslint-disable-next-line react/no-array-index-key
        <li className={classes} key={index} onClick={clickHandler}>
          {property.displayName}
        </li>
      );
    });
  }

  render() {
    const dropdownWrapperClass = classnames(
      this.props.dropdownWrapperClass,
      `${this.props.baseClassName}--direction-${this.props.direction}`,
      {
        [`${this.props.baseClassName}--match-button-width`]: this.props.matchButtonWidth,
        [`${this.props.baseClassName}--width-${this.props.width}`]: this.props.width != null,
        [`${this.props.baseClassName}--no-wrap`]: this.props.nowrap,
        'is-expanded': this.state.isOpen,
      },
    );

    let menu = null;

    if (this.state.isOpen) {
      menu = this.getDropdownMenu(this.props.menuItems);
    }

    return (
      <div className={dropdownWrapperClass}>
        {this.getDropdownButton({header: false, trigger: true})}
        <CSSTransitionGroup transitionName="menu" transitionEnterTimeout={250} transitionLeaveTimeout={250}>
          {menu}
        </CSSTransitionGroup>
      </div>
    );
  }
}

export default Dropdown;
