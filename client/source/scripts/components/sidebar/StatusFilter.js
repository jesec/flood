import classnames from 'classnames';
import React from 'react';

import Icon from '../icons/Icon.js';

const methodsToBind = [
  'handleClick'
];

export default class StatusFilter extends React.Component {

  constructor() {
    super();

    methodsToBind.forEach((method) => {
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
        <Icon icon={this.props.icon} />
        {this.props.name}
      </li>
    );
  }

}
