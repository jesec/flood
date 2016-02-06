import classnames from 'classnames';
import React from 'react';

import TorrentFilterStore from '../../stores/TorrentFilterStore';
import EventTypes from '../../constants/EventTypes';

const METHODS_TO_BIND = [
  'handleClick'
];

export default class StatusFilter extends React.Component {
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
    let itemClass = 'status-filter__item--' + this.props.slug;

    let classNames = classnames({
      'status-filter__item': true,
      itemClass: true,
      'is-active': this.props.isActive
    });

    return (
      <li className={classNames} onClick={this.handleClick}>
        {this.props.icon}
        {this.props.name}
        <span className="status-filter__count">
          {this.props.count}
        </span>
      </li>
    );
  }
}
