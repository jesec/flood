import classnames from 'classnames';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import React from 'react';
import throttle from 'lodash/throttle';
import uniqueId from 'lodash/uniqueId';
import {when} from 'mobx';

import UIActions from '../../../actions/UIActions';
import UIStore from '../../../stores/UIStore';

export interface DropdownItem<T = string> {
  className?: string;
  displayName: React.ReactNode;
  selectable?: boolean;
  selected?: boolean;
  property?: T;
  value?: number | null;
}

type DropdownItems<T> = Array<DropdownItem<T>>;

interface DropdownProps<T> {
  header: React.ReactNode;
  trigger?: React.ReactNode;
  dropdownButtonClass?: string;
  menuItems: Array<DropdownItems<T>>;
  handleItemSelect: (item: DropdownItem<T>) => void;
  onOpen?: () => void;

  dropdownWrapperClass?: string;
  baseClassName?: string;
  direction?: 'down' | 'up';
  width?: 'small' | 'medium' | 'large';
  matchButtonWidth?: boolean;
  noWrap?: boolean;
}

interface DropdownStates {
  isOpen: boolean;
}

const METHODS_TO_BIND = [
  'closeDropdown',
  'openDropdown',
  'handleDropdownClick',
  'handleItemSelect',
  'handleKeyPress',
] as const;

class Dropdown<T = string> extends React.Component<DropdownProps<T>, DropdownStates> {
  id = uniqueId('dropdown_');

  static defaultProps = {
    baseClassName: 'dropdown',
    direction: 'down',
    dropdownWrapperClass: 'dropdown',
    dropdownButtonClass: 'dropdown__trigger',
    matchButtonWidth: false,
    noWrap: false,
  };

  constructor(props: DropdownProps<T>) {
    super(props);

    METHODS_TO_BIND.forEach(<M extends typeof METHODS_TO_BIND[number]>(methodName: M) => {
      this[methodName] = this[methodName].bind(this);
    });

    this.handleKeyPress = throttle(this.handleKeyPress, 200);

    this.state = {
      isOpen: false,
    };

    when(
      () => this.state.isOpen && UIStore.activeDropdownMenu !== this.id,
      () => this.closeDropdown,
    );
  }

  private getDropdownButton(options: {header?: boolean; trigger?: boolean} = {}) {
    const {header, trigger, dropdownButtonClass} = this.props;

    let label = header;
    if (options.trigger && !!trigger) {
      label = trigger;
    }

    return (
      <div className={dropdownButtonClass} onClick={this.handleDropdownClick}>
        {label}
      </div>
    );
  }

  private getDropdownMenu(items: Array<DropdownItems<T>>) {
    const {direction} = this.props;

    // TODO: Rewrite this function, wtf was I thinking
    const arrayMethod = direction === 'up' ? 'unshift' : 'push';
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

    return (
      <CSSTransition classNames="menu" timeout={{enter: 250, exit: 250}}>
        <div className="dropdown__content menu">{content}</div>
      </CSSTransition>
    );
  }

  private getDropdownMenuItems(listItems: DropdownItems<T>) {
    return listItems.map((property, index) => {
      const classes = classnames('dropdown__item menu__item', property.className, {
        'is-selectable': property.selectable !== false,
        'is-selected': property.selected,
      });
      let clickHandler;

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

  closeDropdown() {
    window.removeEventListener('keydown', this.handleKeyPress);
    window.removeEventListener('click', this.closeDropdown);

    this.setState({isOpen: false});
  }

  openDropdown() {
    window.addEventListener('keydown', this.handleKeyPress);
    window.addEventListener('click', this.closeDropdown);

    this.setState({isOpen: true});

    const {onOpen} = this.props;

    if (onOpen) {
      onOpen();
    }

    UIActions.displayDropdownMenu(this.id);
  }

  handleDropdownClick(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();

    const {isOpen} = this.state;

    if (isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  handleItemSelect(item: DropdownItem<T>) {
    const {handleItemSelect} = this.props;

    this.closeDropdown();
    handleItemSelect(item);
  }

  handleKeyPress(event: KeyboardEvent) {
    const {isOpen} = this.state;
    if (isOpen && event.keyCode === 27) {
      this.closeDropdown();
    }
  }

  render() {
    const {baseClassName, dropdownWrapperClass, direction, matchButtonWidth, menuItems, noWrap, width} = this.props;
    const {isOpen} = this.state;

    const dropdownWrapperClassName = classnames(dropdownWrapperClass, `${baseClassName}--direction-${direction}`, {
      [`${baseClassName}--match-button-width`]: matchButtonWidth,
      [`${baseClassName}--width-${width}`]: width != null,
      [`${baseClassName}--no-wrap`]: noWrap,
      'is-expanded': isOpen,
    });

    let menu: React.ReactNode = null;

    if (isOpen) {
      menu = this.getDropdownMenu(menuItems);
    }

    return (
      <div className={dropdownWrapperClassName}>
        {this.getDropdownButton({header: false, trigger: true})}
        <TransitionGroup>{menu}</TransitionGroup>
      </div>
    );
  }
}

export default Dropdown;
