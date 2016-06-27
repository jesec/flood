import classnames from 'classnames';
import React from 'react';

import Badge from '../ui/Badge';
import EventTypes from '../../constants/EventTypes';
import TorrentFilterStore from '../../stores/TorrentFilterStore';

const METHODS_TO_BIND = [
  'handleClick'
];

export default class SidebarFilter extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleClick() {
    this.props.handleClick(this.props.slug);
  }

  render() {
    let itemClass = 'sidebar-filter__item--' + this.props.slug;
    let classNames = classnames({
      'sidebar-filter__item': true,
      [itemClass]: true,
      'is-active': this.props.isActive
    });
    let name = this.props.name;

    if (this.props.name === 'all') {
      name = 'All';
    }

    return (
      <li className={classNames} onClick={this.handleClick}>
        {this.props.icon}
        {name}
        <Badge>
          {this.props.count}
        </Badge>
      </li>
    );
  }
}
