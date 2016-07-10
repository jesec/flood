import {formatMessage, injectIntl} from 'react-intl';
import classnames from 'classnames';
import React from 'react';

import Badge from '../General/Badge';
import EventTypes from '../../constants/EventTypes';
import TorrentFilterStore from '../../stores/TorrentFilterStore';

const METHODS_TO_BIND = [
  'handleClick'
];

class SidebarFilter extends React.Component {
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
      name = this.props.intl.formatMessage({
        id: 'filter.all',
        defaultMessage: 'All'
      });
    } else if (this.props.name === 'untagged') {
      name = this.props.intl.formatMessage({
        id: 'filter.untagged',
        defaultMessage: 'Untagged'
      });
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

export default injectIntl(SidebarFilter);
