import {formatMessage, FormattedMessage, injectIntl} from 'react-intl';
import classnames from 'classnames';
import React from 'react';

import Active from '../Icons/Active';
import All from '../Icons/All';
import Completed from '../Icons/Completed';
import DownloadSmall from '../Icons/DownloadSmall';
import ErrorIcon from '../Icons/ErrorIcon';
import EventTypes from '../../constants/EventTypes';
import Inactive from '../Icons/Inactive';
import SidebarFilter from './SidebarFilter';
import StopIcon from '../Icons/StopIcon';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';

const METHODS_TO_BIND = [
  'getFilters',
  'handleClick',
  'onStatusFilterChange',
  'onTorrentTaxonomyChange'
];

class StatusFilters extends React.Component {
  constructor() {
    super();

    this.state = {
      statusCount: {},
      statusFilter: TorrentFilterStore.getStatusFilter(),
      trackerFilter: TorrentFilterStore.getTrackerFilter()
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    TorrentFilterStore.listen(EventTypes.CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS,
      this.onTorrentTaxonomyChange);
    TorrentFilterStore.listen(EventTypes.UI_TORRENTS_FILTER_STATUS_CHANGE,
      this.onStatusFilterChange);
  }

  componentWillUnmount() {
    TorrentFilterStore.unlisten(EventTypes.CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS,
      this.onTorrentTaxonomyChange);
    TorrentFilterStore.unlisten(EventTypes.UI_TORRENTS_FILTER_STATUS_CHANGE,
      this.onStatusFilterChange);
  }

  handleClick(filter) {
    UIActions.setTorrentStatusFilter(filter);
  }

  getFilters() {
    let filters = [
      {
        label: this.props.intl.formatMessage({
          id: 'filter.all',
          defaultMessage: 'All'
        }),
        slug: 'all',
        icon: <All />
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.downloading',
          defaultMessage: 'Downloading'
        }),
        slug: 'downloading',
        icon: <DownloadSmall />
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.completed',
          defaultMessage: 'Complete'
        }),
        slug: 'complete',
        icon: <Completed />
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.stopped',
          defaultMessage: 'Stopped'
        }),
        slug: 'stopped',
        icon: <StopIcon />
      },
      {
        label: this.props.intl.formatMessage({     
          id: 'filter.status.active',
          defaultMessage: 'All'
        }),
        slug: 'active',
        icon: <Active />
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.inactive',
          defaultMessage: 'Inactive'
        }),
        slug: 'inactive',
        icon: <Inactive />
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.error',
          defaultMessage: 'Error'
        }),
        slug: 'error',
        icon: <ErrorIcon />
      }
    ];

    let filterElements = filters.map((filter) => {
      return (
        <SidebarFilter handleClick={this.handleClick}
          count={this.state.statusCount[filter.slug] || 0}
          key={filter.slug}
          icon={filter.icon}
          isActive={filter.slug === this.state.statusFilter}
          name={filter.label}
          slug={filter.slug} />
      );
    });

    return filterElements;
  }

  onStatusFilterChange() {
    this.setState({
      statusFilter: TorrentFilterStore.getStatusFilter()
    });
  }

  onTorrentTaxonomyChange() {
    let statusCount = TorrentFilterStore.getTorrentStatusCount();
    this.setState({statusCount});
  }

  render() {
    let filters = this.getFilters();

    return (
      <ul className="sidebar-filter sidebar__item">
        <li className="sidebar-filter__item sidebar-filter__item--heading">
          <FormattedMessage
            id="filter.status.title"
            defaultMessage="Filter by Status"
          />
        </li>
        {filters}
      </ul>
    );
  }
}

export default injectIntl(StatusFilters);
