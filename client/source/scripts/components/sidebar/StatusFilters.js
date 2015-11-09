import classnames from 'classnames';
import React from 'react';

import Icon from '../icons/Icon.js';
import StatusFilter from './StatusFilter';
import UIActions from '../../actions/UIActions';

const methodsToBind = [
  'getFilters'
];

export default class StatusFilters extends React.Component {

  constructor() {
    super();

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.activeFilter !== this.props.activeFilter) {
      return true;
    } else {
      return false;
    }
  }

  getFilters() {
    let filters = [
      {
        label: 'All',
        slug: 'all',
        icon: 'all'
      },
      {
        label: 'Downloading',
        slug: 'downloading',
        icon: 'downloadSmall'
      },
      {
        label: 'Completed',
        slug: 'completed',
        icon: 'completed'
      },
      {
        label: 'Active',
        slug: 'active',
        icon: 'active'
      },
      {
        label: 'Inactive',
        slug: 'inactive',
        icon: 'inactive'
      },
      {
        label: 'Error',
        slug: 'error',
        icon: 'error'
      }
    ];

    let filterElements = filters.map(filter => {
      return <StatusFilter handleClick={this.props.handleFilterChange}
        key={filter.slug}
        icon={filter.icon}
        isActive={this.props.activeFilter === filter.slug}
        name={filter.label}
        slug={filter.slug} />;
    });

    return filterElements;
  }

  render() {
    let filters = this.getFilters();

    return (
      <ul className="status-filter sidebar__item">
        <li className="status-filter__item status-filter__item--heading">
          Filter by Status
        </li>
        {filters}
      </ul>
    );
  }

}
