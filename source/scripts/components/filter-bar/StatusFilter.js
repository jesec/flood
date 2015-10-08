import classnames from 'classnames';
import React from 'react';

import Icon from '../icons/Icon.js';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';

const methodsToBind = [
  'componentDidMount',
  'componentWillUnmount',
  '_onClick',
  '_onFilterChange'
];

class StatusFilter extends React.Component {

  constructor() {
    super();

    this.state = {
      activeFilter: TorrentStore.getFilterCriteria()
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    TorrentStore.addFilterChangeListener(this._onFilterChange);
  }

  componentWillUnmount() {
    TorrentStore.removeFilterChangeListener(this._onFilterChange);
  }

  render() {

    let itemClass = 'status-filter__item--' + this.props.slug;

    let classNames = classnames({
      'status-filter__item': true,
      itemClass: true,
      'is-active': this.state.activeFilter === this.props.slug
    });

    return (
      <li className={classNames} onClick={this._onClick}>
        <Icon icon={this.props.icon} />
        {this.props.name}
      </li>
    );
  }

  _onClick(action) {
    UIActions.filterTorrentList(this.props.slug);
  }

  _onFilterChange() {
    this.setState({
      activeFilter: TorrentStore.getFilterCriteria()
    })
  }

}

export default class StatusFilterList extends React.Component {

  constructor() {
    super();
  }

  render() {

    let filters = [
      'All',
      'Downloading',
      'Completed',
      'Active',
      'Inactive',
      'Error'
    ];

    return (
      <ul className="status-filter filter-bar__item">
        <li className="status-filter__item status-filter__item--heading">
          Filter by Status
        </li>
        <StatusFilter icon="all" name="All" slug="all" />
        <StatusFilter icon="downloadSmall" name="Downloading" slug="downloading" />
        <StatusFilter icon="completed" name="Completed" slug="completed" />
        <StatusFilter icon="active" name="Active" slug="active" />
        <StatusFilter icon="inactive" name="Inactive" slug="inactive" />
        <StatusFilter icon="error" name="Error" slug="error" />
      </ul>
    );
  }

}
