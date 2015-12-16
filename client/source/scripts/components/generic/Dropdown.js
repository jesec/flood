import classnames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

const methodsToBind = [
  'componentDidMount',
  'componentWillUnmount',
  'getDropdownMenu',
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

  getDropdownMenu() {
    let menuItems = this.props.menuItems.map(function(property, index) {
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
          {this.props.header}
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

  onItemSelect(item) {
    this.setState({
      isExpanded: false
    });
    this.props.handleItemSelect(item);
  }

  render() {
    let classes = classnames({
      'dropdown': true,
      'is-expanded': this.state.isExpanded,
      [this.props.dropdownClasses]: true
    });

    let menu = null;

    if (this.state.isExpanded) {
      menu = this.getDropdownMenu();
    }

    return (
      <div className={classes} onClick={this.onDropdownClick}>
        {this.props.header}
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
