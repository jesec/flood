import classnames from 'classnames';
import {reaction} from 'mobx';
import * as React from 'react';

import {ContextMenu} from '../../ui';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

import type {ContextMenu as ContextMenuType, ContextMenuItem} from '../../stores/UIStore';

interface GlobalContextMenuMountPointProps {
  id: ContextMenuType['id'];
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

interface GlobalContextMenuMountPointStates {
  clickPosition: ContextMenuType['clickPosition'];
  isOpen: boolean;
  items: ContextMenuType['items'];
}

class GlobalContextMenuMountPoint extends React.Component<
  GlobalContextMenuMountPointProps,
  GlobalContextMenuMountPointStates
> {
  constructor(props: GlobalContextMenuMountPointProps) {
    super(props);

    reaction(() => UIStore.activeContextMenu, this.handleContextMenuChange);

    this.state = {
      clickPosition: {
        x: 0,
        y: 0,
      },
      isOpen: false,
      items: [],
    };
  }

  shouldComponentUpdate(_nextProps: GlobalContextMenuMountPointProps, nextState: GlobalContextMenuMountPointStates) {
    const {isOpen, clickPosition, items} = this.state;

    if (!isOpen && !nextState.isOpen) {
      return false;
    }

    if (isOpen !== nextState.isOpen) {
      return true;
    }

    let shouldUpdate = true;

    if (clickPosition.x === nextState.clickPosition.x && clickPosition.y === nextState.clickPosition.y) {
      shouldUpdate = false;
    }

    if (!shouldUpdate) {
      return items.some((item, index) => item !== nextState.items[index]);
    }

    return shouldUpdate;
  }

  componentDidUpdate(prevProps: GlobalContextMenuMountPointProps, prevState: GlobalContextMenuMountPointStates) {
    const {isOpen} = this.state;

    if (!prevState.isOpen && isOpen) {
      document.addEventListener('keydown', this.handleKeyPress);

      if (prevProps.onMenuOpen) {
        prevProps.onMenuOpen();
      }
    } else if (prevState.isOpen && !isOpen) {
      document.removeEventListener('keydown', this.handleKeyPress);

      if (prevProps.onMenuClose) {
        prevProps.onMenuClose();
      }
    }
  }

  getMenuItems() {
    const {items} = this.state;

    return items.map((item, index) => {
      let menuItemContent;
      let menuItemClasses;

      switch (item.type) {
        case 'action':
          menuItemClasses = classnames('menu__item', {
            'is-selectable': item.clickHandler,
          });
          menuItemContent = (
            <span>
              <span
                className={classnames('menu__item__label--primary', {
                  'has-action': item.labelAction,
                })}>
                <span className="menu__item__label">{item.label}</span>
                {item.labelAction ? (
                  <span className="menu__item__label__action">
                    <item.labelAction />
                  </span>
                ) : undefined}
              </span>
              {item.labelSecondary ? (
                <span className="menu__item__label--secondary">
                  <item.labelSecondary />
                </span>
              ) : undefined}
            </span>
          );
          break;
        case 'separator':
        default:
          menuItemClasses = classnames('menu__item', {
            'menu__item--separator': item.type === 'separator',
          });
          break;
      }

      return (
        <li
          className={menuItemClasses}
          key={item.type === 'action' ? item.action : `sep-${index}`}
          onClick={this.handleMenuItemClick.bind(this, item)}>
          {menuItemContent}
        </li>
      );
    });
  }

  handleContextMenuChange = () => {
    const {activeContextMenu} = UIStore;

    if (activeContextMenu != null && activeContextMenu.id === this.props.id) {
      this.setState({
        isOpen: true,
        clickPosition: activeContextMenu.clickPosition,
        items: activeContextMenu.items,
      });
    } else if (this.state.isOpen) {
      this.setState({
        isOpen: false,
      });
    }
  };

  handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      UIActions.dismissContextMenu(this.props.id);
    }
  };

  handleOverlayClick = () => {
    UIActions.dismissContextMenu(this.props.id);
  };

  handleMenuItemClick(item: ContextMenuItem, event: React.MouseEvent<HTMLLIElement>) {
    const {id} = this.props;

    if (item.type !== 'separator') {
      if (item.dismissMenu === false) {
        event.nativeEvent.stopImmediatePropagation();
      }

      if (item.clickHandler) {
        item.clickHandler(item.action, event);
      }

      if (item.dismissMenu !== false) {
        UIActions.dismissContextMenu(id);
      }
    }

    return false;
  }

  render() {
    const {clickPosition, isOpen} = this.state;

    return (
      <ContextMenu triggerCoordinates={clickPosition} onOverlayClick={this.handleOverlayClick} isIn={isOpen}>
        {this.getMenuItems()}
      </ContextMenu>
    );
  }
}

export default GlobalContextMenuMountPoint;
