import _ from 'lodash';
import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

const METHODS_TO_BIND = [
  'getDropdownButton',
  'getDropdownMenu',
  'getDropdownMenuItems',
  'handleDropdownBlur',
  'handleDropdownClick',
  'handleDropdownFocus',
  'handleItemSelect',
  'handleKeyPress'
];

export default class Dropdown extends React.Component {
  constructor() {
    super();

    this.state = {
      isExpanded: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.handleKeyPress = _.throttle(this.handleKeyPress, 1000);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress);
  }

  closeDropdown() {
    this.refs.dropdown.blur();
  }

  handleDropdownBlur() {
    this.setState({
      isExpanded: false
    });
  }

  handleDropdownClick() {
    if (this.state.isExpanded) {
      this.closeDropdown();
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
    this.closeDropdown();
    this.props.handleItemSelect(item);
  }

  handleKeyPress(event) {
    if (this.state.isExpanded && event.keyCode === 27) {
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
    let dropdownLists = items.map((itemList, index) => {
      return (
        <div className="dropdown__list" key={index}>
          {this.getDropdownMenuItems(itemList)}
        </div>
      );
    }, this);

    return (
      <div className="dropdown__content menu">
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
        <li className={classes} key={index} onClick={clickHandler}>
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
        {this.getDropdownButton({trigger: true})}
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
  menuItems: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.object)).isRequired
};
