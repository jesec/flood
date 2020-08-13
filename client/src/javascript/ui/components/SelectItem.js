import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Checkmark from '../icons/Checkmark';
import ContextMenuItem from './ContextMenuItem';

export default class SelectItem extends Component {
  static propTypes = {
    isSelected: PropTypes.bool,
    isTrigger: PropTypes.bool,
    children: PropTypes.node,
  };

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
