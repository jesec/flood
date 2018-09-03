import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

class SidebarItem extends React.Component {
  static propTypes = {
    baseClassName: PropTypes.string,
    children: PropTypes.node,
    modifier: PropTypes.string,
  };

  static defaultProps = {
    baseClassName: 'sidebar__item',
  };

  render() {
    let classes = classnames(this.props.baseClassName, {
      [`${this.props.baseClassName}--${this.props.modifier}`]: this.props.modifier,
    });

    return <div className={classes}>{this.props.children}</div>;
  }
}

export default SidebarItem;
