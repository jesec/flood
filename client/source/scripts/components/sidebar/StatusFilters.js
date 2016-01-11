import classnames from 'classnames';
import React from 'react';

import Active from '../../components/icons/Active';
import All from '../../components/icons/All';
import Completed from '../../components/icons/Completed';
import DownloadSmall from '../../components/icons/DownloadSmall';
import Error from '../../components/icons/Error';
import EventTypes from '../../constants/EventTypes';
import Inactive from '../../components/icons/Inactive';
import StatusFilter from './StatusFilter';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import UIActions from '../../actions/UIActions';

const METHODS_TO_BIND = [
  'getFilters',
  'handleClick',
  'onStatusFilterChange'
];

export default class StatusFilters extends React.Component {
  constructor() {
    super();

    this.state = {
      statusFilter: TorrentFilterStore.getStatusFilter()
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    TorrentFilterStore.listen(EventTypes.UI_TORRENTS_FILTER_STATUS_CHANGE, this.onStatusFilterChange);
  }

  componentWillUnmount() {
    TorrentFilterStore.unlisten(EventTypes.UI_TORRENTS_FILTER_STATUS_CHANGE, this.onStatusFilterChange);
  }

  handleClick(filter) {
    UIActions.setTorrentStatusFilter(filter);
  }

  onStatusFilterChange() {
    this.setState({
      statusFilter: TorrentFilterStore.getStatusFilter()
    });
  }

  getFilters() {
    let filters = [
      {
        label: 'All',
        slug: 'all',
        icon: <All />
      },
      {
        label: 'Downloading',
        slug: 'downloading',
        icon: <DownloadSmall />
      },
      {
        label: 'Completed',
        slug: 'completed',
        icon: <Completed />
      },
      {
        label: 'Active',
        slug: 'active',
        icon: <Active />
      },
      {
        label: 'Inactive',
        slug: 'inactive',
        icon: <Inactive />
      },
      {
        label: 'Error',
        slug: 'error',
        icon: <Error />
      }
    ];

    let filterElements = filters.map((filter) => {
      return <StatusFilter handleClick={this.handleClick}
        key={filter.slug}
        icon={filter.icon}
        isActive={filter.slug === this.state.statusFilter}
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
