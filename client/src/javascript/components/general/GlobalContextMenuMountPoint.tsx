import classnames from 'classnames';
import React from 'react';

import {ContextMenu} from '../../ui';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

import type {ContextMenu as ContextMenuType, ContextMenuItem} from '../../stores/UIStore';

interface GlobalContextMenuMountPointProps {
  id: ContextMenuType['id'];
  onMenuOpen: () => void;
  onMenuClose: () => void;
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
    this.state = {
      clickPosition: {
        x: 0,
        y: 0,
      },
      isOpen: false,
      items: [],
    };
  }

  componentDidMount() {
    UIStore.listen('UI_CONTEXT_MENU_CHANGE', this.handleContextMenuChange);
  }

  shouldComponentUpdate(_nextProps: GlobalContextMenuMountPointProps, nextState: GlobalContextMenuMountPointStates) {
    if (!this.state.isOpen && !nextState.isOpen) {
      return false;
    }

    if (this.state.isOpen !== nextState.isOpen) {
      return true;
    }

    let shouldUpdate = true;

    if (
      this.state.clickPosition.x === nextState.clickPosition.x &&
      this.state.clickPosition.y === nextState.clickPosition.y
    ) {
      shouldUpdate = false;
    }

    if (!shouldUpdate) {
      return this.state.items.some((item, index) => item !== nextState.items[index]);
    }

    return shouldUpdate;
  }

  componentDidUpdate(prevProps: GlobalContextMenuMountPointProps, prevState: GlobalContextMenuMountPointStates) {
    if (!prevState.isOpen && this.state.isOpen) {
      document.addEventListener('keydown', this.handleKeyPress);

      if (prevProps.onMenuOpen) {
        prevProps.onMenuOpen();
      }
    } else if (prevState.isOpen && !this.state.isOpen) {
      document.removeEventListener('keydown', this.handleKeyPress);

      if (prevProps.onMenuClose) {
        prevProps.onMenuClose();
      }
    }
  }

  componentWillUnmount() {
    UIStore.unlisten('UI_CONTEXT_MENU_CHANGE', this.handleContextMenuChange);
  }

  getMenuItems() {
    return this.state.items.map((item, index) => {
      let labelAction;
      let labelSecondary;
      let menuItemContent;

      const menuItemClasses = classnames('menu__item', {
        'is-selectable': item.clickHandler,
        'menu__item--separator': item.type === 'separator',
      });
      const primaryLabelClasses = classnames('menu__item__label--primary', {
        'has-action': item.labelAction,
      });

      if (item.labelSecondary) {
        labelSecondary = <span className="menu__item__label--secondary">{item.labelSecondary}</span>;
      }

      if (item.labelAction) {
        labelAction = <span className="menu__item__label__action">{item.labelAction}</span>;
      }

      if (item.type !== 'separator') {
        menuItemContent = (
          <span>
            <span className={primaryLabelClasses}>
              <span className="menu__item__label">{item.label}</span>
              {labelAction}
            </span>
            {labelSecondary}
          </span>
        );
      }

      return (
        // TODO: Find a better key for this
        // eslint-disable-next-line react/no-array-index-key
        <li className={menuItemClasses} key={index} onClick={this.handleMenuItemClick.bind(this, item)}>
          {menuItemContent}
        </li>
      );
    });
  }

  handleContextMenuChange = () => {
    const activeContextMenu = UIStore.getActiveContextMenu();

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

  handleMenuItemClick(item: ContextMenuItem, event: React.MouseEvent<HTMLLIElement>) {
    if (item.dismissMenu === false) {
      event.nativeEvent.stopImmediatePropagation();
    }

    if (item.clickHandler) {
      item.clickHandler(item.action, event);
    }

    if (item.dismissMenu !== false) {
      UIActions.dismissContextMenu(this.props.id);
    }

    return false;
  }

  handleOverlayClick = () => {
    UIActions.dismissContextMenu(this.props.id);
  };

  render() {
    return (
      <ContextMenu
        triggerCoordinates={this.state.clickPosition}
        onOverlayClick={this.handleOverlayClick}
        in={this.state.isOpen}>
        {this.getMenuItems()}
      </ContextMenu>
    );
  }
}

export default GlobalContextMenuMountPoint;
