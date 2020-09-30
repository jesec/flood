import classnames from 'classnames';
import React, {Component} from 'react';

import Checkmark from '../icons/Checkmark';
import ContextMenuItem from './ContextMenuItem';

interface SelectItemProps {
  id?: string | number;
  isSelected?: boolean;
  isTrigger?: boolean;
  placeholder?: boolean;
  onClick?: (id: this['id']) => void;
}

export default class SelectItem extends Component<SelectItemProps> {
  static defaultProps = {
    isTrigger: false,
  };

  handleClick = () => {
    if (!this.props.onClick) {
      return;
    }

    this.props.onClick(this.props.id);
  };

  render() {
    let icon = null;

    if (!this.props.isTrigger && this.props.isSelected) {
      icon = <Checkmark />;
    }

    const classes = classnames({
      'select__item context-menu__item': !this.props.isTrigger,
      'select__item--is-selected': this.props.isSelected,
    });

    return (
      <ContextMenuItem className={classes} onClick={this.handleClick}>
        {icon}
        {this.props.children}
      </ContextMenuItem>
    );
  }
}
