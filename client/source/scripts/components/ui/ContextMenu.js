import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

export default class ContextMenu extends React.Component {
  constructor() {
    super();

    this.state = {
      menuPosition: {},
      isMenuPositionIdeal: false
    };
  }

  componentDidMount() {
    if (this.props.onMenuOpen) {
      this.props.onMenuOpen();
    }

    this.checkMenuPosition();
  }

  componentDidUpdate() {
    this.checkMenuPosition();
  }

  componentWillUnmount() {
    if (this.props.onMenuClose) {
      this.props.onMenuClose();
    }
  }

  componentWillUpdate(nextProps) {
    if (nextProps.clickPosition.x !== this.props.clickPosition.x
      || nextProps.clickPosition.y !== this.props.clickPosition.y) {
      this.setState({
        isMenuPositionIdeal: false,
        menuPosition: this.getMenuPosition()
      });
    }
  }

  checkMenuPosition() {
    if (!this.state.isMenuPositionIdeal) {
      this.setState({
        isMenuPositionIdeal: true,
        menuPosition: this.getMenuPosition()
      });
    }
  }

  getMenuPosition() {
    let menuBorderBox = this.getRenderedMenuBorderBox();
    let viewportDimensions = this.getViewportDimensions();
    let menuPosition = {};

    if (menuBorderBox.left + menuBorderBox.width > viewportDimensions.width) {
      menuPosition.right = viewportDimensions.width - this.props.clickPosition.x;
    } else {
      menuPosition.left = menuBorderBox.left;
    }

    if (menuBorderBox.height + this.props.clickPosition.y > viewportDimensions.height) {
      menuPosition.bottom = viewportDimensions.height - this.props.clickPosition.y;
    } else {
      menuPosition.top = menuBorderBox.top;
    }

    return menuPosition;
  }

  getViewportDimensions() {
    let height = global.window.innerHeight;
    let width = global.window.innerWidth;

    return {height, width};
  }

  getRenderedMenuBorderBox() {
    let menuDOMNode = ReactDOM.findDOMNode(this);

    if (menuDOMNode) {
      return menuDOMNode.getBoundingClientRect();
    }

    return null;
  }

  getMenuItems(items) {
    return items.map((item, index) => {
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

  handleMenuItemClick(item, event) {
    if (item.clickHandler) {
      item.clickHandler(item.action, event);
    }
  }

  render() {
    let className = 'context-menu menu';
    let menuPosition = {
      left: this.props.clickPosition.x,
      top: this.props.clickPosition.y
    };
    let visibility = 'hidden';

    if (this.state.isMenuPositionIdeal) {
      visibility = 'visible';
      menuPosition = this.state.menuPosition;
    }

    let styles = {
      width: `${this.props.width}px`,
      ...menuPosition,
      visibility
    };

    return (
      <div className={className} style={styles}>
        {this.getMenuItems(this.props.items)}
      </div>
    );
  }
}

ContextMenu.defaultProps = {
  width: 200
};

ContextMenu.propTypes = {
  clickPosition: React.PropTypes.object,
  onMenuClose: React.PropTypes.func,
  onMenuOpen: React.PropTypes.func,
  items: React.PropTypes.array,
  width: React.PropTypes.number
};
