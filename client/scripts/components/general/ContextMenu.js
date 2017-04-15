import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

import EventTypes from '../../constants/EventTypes';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

const methodsToBind = [
  'handleContextMenuChange',
  'handleClick',
  'handleKeyPress'
];

class ContextMenu extends React.Component {
  constructor() {
    super();

    this.state = {
      clickPosition: {},
      isMenuPositionIdeal: false,
      isOpen: false,
      items: [],
      menuPosition: {}
    };

    methodsToBind.forEach(method => this[method] = this[method].bind(this));
  }

  componentDidMount() {
    UIStore.listen(
      EventTypes.UI_CONTEXT_MENU_CHANGE,
      this.handleContextMenuChange
    );
  }

  componentWillUnmount() {
    UIStore.unlisten(
      EventTypes.UI_CONTEXT_MENU_CHANGE,
      this.handleContextMenuChange
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.state.isOpen && !nextState.isOpen) {
      return false;
    }

    if (this.state.isOpen !== nextState.isOpen
      || !this.state.isMenuPositionIdeal && nextState.isMenuPositionIdeal) {
      return true;
    }

    let shouldUpdate = true;

    if (this.state.clickPosition.x === nextState.clickPosition.x
      && this.state.clickPosition.y === nextState.clickPosition.y) {
      shouldUpdate = false;
    }

    if (!shouldUpdate) {
      shouldUpdate = this.state.items.some((item, index) => {
        return item !== nextState.items[index];
      });
    }

    return shouldUpdate;
  }

  componentWillUpdate(nextProps, nextState) {
    if (!this.state.isOpen && nextState.isOpen) {
      global.document.addEventListener('keydown', this.handleKeyPress);
      global.document.addEventListener('click', this.handleClick);

      if (this.props.onMenuOpen) {
        this.props.onMenuOpen();
      }
    } else if (this.state.isOpen && !nextState.isOpen) {
      global.document.removeEventListener('keydown', this.handleKeyPress);
      global.document.removeEventListener('click', this.handleClick);

      if (this.props.onMenuClose) {
        this.props.onMenuClose();
      }
    }
  }

  checkMenuPosition() {
    this.setState({
      isMenuPositionIdeal: true,
      menuPosition: this.getMenuPosition()
    });
  }

  getMenuPosition() {
    const {clickPosition} = this.state;
    const menuBorderBox = this.getRenderedMenuBorderBox();
    const viewportDimensions = this.getViewportDimensions();
    const menuPosition = {};

    let shouldRenderRight = true;
    let shouldRenderDown = true;

    if (menuBorderBox.left + menuBorderBox.width > viewportDimensions.width) {
      shouldRenderRight = false;
    }

    if (menuBorderBox.height + clickPosition.y > viewportDimensions.height
      && clickPosition.y > viewportDimensions.height / 2) {
      shouldRenderDown = false;
    }

    if (shouldRenderDown) {
      menuPosition.top = menuBorderBox.top;
    } else {
      menuPosition.bottom = viewportDimensions.height - clickPosition.y;
    }

    if (shouldRenderRight) {
      menuPosition.left = menuBorderBox.left;
    } else {
      menuPosition.right = viewportDimensions.width - clickPosition.x;
    }

    return menuPosition;
  }

  getViewportDimensions() {
    let height = global.window.innerHeight;
    let width = global.window.innerWidth;

    return {height, width};
  }

  getRenderedMenuBorderBox() {
    const menuDOMNode = ReactDOM.findDOMNode(this);

    if (menuDOMNode) {
      return menuDOMNode.getBoundingClientRect();
    }

    return null;
  }

  getMenuItems() {
    return this.state.items.map((item, index) => {
      let labelAction, labelSecondary, menuItemContent;
      let menuItemClasses = classnames('menu__item', {
        'is-selectable': item.clickHandler,
        'menu__item--separator': item.type === 'separator'
      });
      let primaryLabelClasses = classnames('menu__item__label--primary', {
        'has-action': item.labelAction
      });

      if (item.labelSecondary) {
        labelSecondary = (
          <span className="menu__item__label--secondary">
            {item.labelSecondary}
          </span>
        );
      }

      if (item.labelAction) {
        labelAction = (
          <span className="menu__item__label__action">
            {item.labelAction}
          </span>
        );
      }

      if (item.type !== 'separator') {
        menuItemContent = (
          <span>
            <span className={primaryLabelClasses}>
              <span className="menu__item__label">
                {item.label}
              </span>
              {labelAction}
            </span>
            {labelSecondary}
          </span>
        );
      }

      return (
        <li className={menuItemClasses} key={index} onClick={this.handleMenuItemClick.bind(this, item)}>
          {menuItemContent}
        </li>
      );
    });
  }

  handleClick(event) {
    if (event.which === 1) {
      UIActions.dismissContextMenu(this.props.id);
    }
  }

  handleContextMenuChange() {
    const activeContextMenu = UIStore.getActiveContextMenu();

    if (activeContextMenu != null && activeContextMenu.id === this.props.id) {
      this.setState({
        isOpen: true,
        clickPosition: {
          x: activeContextMenu.clickPosition.x,
          y: activeContextMenu.clickPosition.y
        },
        isMenuPositionIdeal: false,
        items: activeContextMenu.items
      }, this.checkMenuPosition);
    } else if (this.state.isOpen) {
      this.setState({
        isOpen: false
      });
    }
  }

  handleKeyPress(event) {
    if (event.keyCode === 27) {
      UIActions.dismissContextMenu(this.props.id);
    }
  }

  handleMenuItemClick(item, event) {
    if (item.dismissMenu === false) {
      event.nativeEvent.stopImmediatePropagation();
    }

    if (item.clickHandler) {
      item.clickHandler(item.action, event);
    }

    return false;
  }

  render() {
    const {props, state} = this;
    const classes = classnames('context-menu menu', {
      'context-menu--is-open': state.isOpen && state.isMenuPositionIdeal
    });
    let menuPositionStyles = {
      left: state.clickPosition.x || 0,
      top: state.clickPosition.y || 0
    };
    let pointerEventsStyles = {pointerEvents: 'none'};
    let visibility = 'hidden';

    if (state.isMenuPositionIdeal) {
      visibility = 'visible';
      menuPositionStyles = state.menuPosition;
    }

    if (state.isOpen) {
      pointerEventsStyles = {};
    }

    const styles = {
      width: `${props.width}px`,
      ...menuPositionStyles,
      ...pointerEventsStyles,
      visibility
    };

    return (
      <div className={classes} style={styles}>
        {this.getMenuItems()}
      </div>
    );
  }
}

ContextMenu.defaultProps = {
  width: 200
};

ContextMenu.propTypes = {
  onMenuClose: React.PropTypes.func,
  onMenuOpen: React.PropTypes.func,
  id: React.PropTypes.string.isRequired,
  width: React.PropTypes.number
};

export default ContextMenu;
