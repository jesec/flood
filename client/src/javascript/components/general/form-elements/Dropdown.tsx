import classnames from 'classnames';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import React from 'react';
import throttle from 'lodash/throttle';
import uniqueId from 'lodash/uniqueId';

import UIActions from '../../../actions/UIActions';
import UIStore from '../../../stores/UIStore';

export interface DropdownItem {
  className?: string;
  displayName: React.ReactNode;
  selectable: boolean;
  selected?: boolean;
  property?: string;
  value?: number | null;
}

type DropdownItems = Array<DropdownItem>;

interface DropdownProps {
  header: React.ReactNode;
  trigger?: React.ReactNode;
  dropdownButtonClass?: string;
  menuItems: Array<DropdownItems>;
  handleItemSelect: (item: DropdownItem) => void;
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
  'handleActiveDropdownChange',
  'handleDropdownClick',
  'handleItemSelect',
  'handleKeyPress',
] as const;

class Dropdown extends React.Component<DropdownProps, DropdownStates> {
  id = uniqueId('dropdown_');

  static defaultProps = {
    baseClassName: 'dropdown',
    direction: 'down',
    dropdownWrapperClass: 'dropdown',
    dropdownButtonClass: 'dropdown__trigger',
    matchButtonWidth: false,
    noWrap: false,
  };

  constructor(props: DropdownProps) {
    super(props);

    this.state = {
      isOpen: false,
    };

    METHODS_TO_BIND.forEach(<T extends typeof METHODS_TO_BIND[number]>(methodName: T) => {
      this[methodName] = this[methodName].bind(this);
    });

    this.handleKeyPress = throttle(this.handleKeyPress, 200);
  }

  closeDropdown() {
    window.removeEventListener('keydown', this.handleKeyPress);
    window.removeEventListener('click', this.closeDropdown);
    UIStore.unlisten('UI_DROPDOWN_MENU_CHANGE', this.handleActiveDropdownChange);

    this.setState({isOpen: false});
  }

  openDropdown() {
    window.addEventListener('keydown', this.handleKeyPress);
    window.addEventListener('click', this.closeDropdown);
    UIStore.listen('UI_DROPDOWN_MENU_CHANGE', this.handleActiveDropdownChange);

    this.setState({isOpen: true});

    if (this.props.onOpen) {
      this.props.onOpen();
    }

    UIActions.displayDropdownMenu(this.id);
  }

  handleDropdownClick(event: React.MouseEvent<HTMLDivElement>) {
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

  handleItemSelect(item: DropdownItem) {
    this.closeDropdown();
    this.props.handleItemSelect(item);
  }

  handleKeyPress(event: KeyboardEvent) {
    if (this.state.isOpen && event.keyCode === 27) {
      this.closeDropdown();
    }
  }

  private getDropdownButton(options: {header?: boolean; trigger?: boolean} = {}) {
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

  private getDropdownMenu(items: Array<DropdownItems>) {
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

    return (
      <CSSTransition classNames="menu" timeout={{enter: 250, exit: 250}}>
        <div className="dropdown__content menu">{content}</div>
      </CSSTransition>
    );
  }

  private getDropdownMenuItems(listItems: DropdownItems) {
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

  render() {
    const dropdownWrapperClass = classnames(
      this.props.dropdownWrapperClass,
      `${this.props.baseClassName}--direction-${this.props.direction}`,
      {
        [`${this.props.baseClassName}--match-button-width`]: this.props.matchButtonWidth,
        [`${this.props.baseClassName}--width-${this.props.width}`]: this.props.width != null,
        [`${this.props.baseClassName}--no-wrap`]: this.props.noWrap,
        'is-expanded': this.state.isOpen,
      },
    );

    let menu: React.ReactNode = null;

    if (this.state.isOpen) {
      menu = this.getDropdownMenu(this.props.menuItems);
    }

    return (
      <div className={dropdownWrapperClass}>
        {this.getDropdownButton({header: false, trigger: true})}
        <TransitionGroup>{menu}</TransitionGroup>
      </div>
    );
  }
}

export default Dropdown;
