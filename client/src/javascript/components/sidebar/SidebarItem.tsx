import classnames from 'classnames';
import React from 'react';

interface SidebarItemProps {
  baseClassName: string;
  modifier: string;
}

class SidebarItem extends React.Component<SidebarItemProps> {
  static defaultProps = {
    baseClassName: 'sidebar__item',
  };

  render() {
    const classes = classnames(this.props.baseClassName, {
      [`${this.props.baseClassName}--${this.props.modifier}`]: this.props.modifier,
    });

    return <div className={classes}>{this.props.children}</div>;
  }
}

export default SidebarItem;
