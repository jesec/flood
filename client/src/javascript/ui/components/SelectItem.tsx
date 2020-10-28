import classnames from 'classnames';
import {Component} from 'react';

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
    const {children, isTrigger, isSelected} = this.props;

    let icon = null;
    if (!isTrigger && isSelected) {
      icon = <Checkmark />;
    }

    const classes = classnames({
      'select__item context-menu__item': !isTrigger,
      'select__item--is-selected': isSelected,
    });

    return (
      <ContextMenuItem className={classes} onClick={this.handleClick}>
        {icon}
        {children}
      </ContextMenuItem>
    );
  }
}
