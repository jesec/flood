import classnames from 'classnames';
import React from 'react';
import { injectIntl, formatMessage, FormattedMessage } from 'react-intl';

import Active from '../Icons/Active';
import All from '../Icons/All';
import Completed from '../Icons/Completed';
import DownloadSmall from '../Icons/DownloadSmall';
import ErrorIcon from '../Icons/ErrorIcon';
import EventTypes from '../../constants/EventTypes';
import Inactive from '../Icons/Inactive';
import propsMap from '../../../../shared/constants/propsMap';
import SidebarFilter from './SidebarFilter';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';

const METHODS_TO_BIND = [
  'getFilters',
  'handleClick',
  'onStatusFilterChange',
  'onTorrentStatusCountChange',
  'updateStatusCount'
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
    TorrentStore.listen(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS, this.onTorrentRequestSuccess);
    TorrentFilterStore.listen(EventTypes.CLIENT_TORRENT_STATUS_COUNT_CHANGE, this.onTorrentStatusCountChange);
    TorrentFilterStore.listen(EventTypes.UI_TORRENTS_FILTER_STATUS_CHANGE, this.onStatusFilterChange);
    TorrentFilterStore.fetchTorrentStatusCount();
  }

  componentWillUnmount() {
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS, this.onTorrentRequestSuccess);
    TorrentFilterStore.unlisten(EventTypes.CLIENT_TORRENT_STATUS_COUNT_CHANGE, this.onTorrentStatusCountChange);
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

  onTorrentRequestSuccess() {
    TorrentFilterStore.fetchTorrentStatusCount();
  }

  onTorrentStatusCountChange() {
    this.updateStatusCount();
  }

  getFilters() {
    let filters = [
      {
        label: this.props.intl.formatMessage({
          id: 'statusfilter.all',
          defaultMessage: 'All'
        }),
        slug: 'all',
        icon: <All />
      },
      {
        label: this.props.intl.formatMessage({
          id: 'statusfilter.downloading',
          defaultMessage: 'Downloading'
        }),
        slug: 'downloading',
        icon: <DownloadSmall />
      },
      {
        label: this.props.intl.formatMessage({
          id: 'statusfilter.completed',
          defaultMessage: 'Completed'
        }),
        slug: 'completed',
        icon: <Completed />
      },
      {
        label: this.props.intl.formatMessage({
          id: 'statusfilter.active',
          defaultMessage: 'All'
        }),
        slug: 'active',
        icon: <Active />
      },
      {
        label: this.props.intl.formatMessage({
          id: 'statusfilter.inactive',
          defaultMessage: 'Inactive'
        }),
        slug: 'inactive',
        icon: <Inactive />
      },
      {
        label: this.props.intl.formatMessage({
          id: 'statusfilter.error',
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

  updateStatusCount() {
    let statusCount = TorrentFilterStore.getTorrentStatusCount();
    this.setState({statusCount});
  }

  render() {
    let filters = this.getFilters();

    return (
      <ul className="sidebar-filter sidebar__item">
        <li className="sidebar-filter__item sidebar-filter__item--heading">
          <FormattedMessage
            id="statusfilter.title"
            defaultMessage="Filter by Status"
          />
        </li>
        {filters}
      </ul>
    );
  }
}

export default injectIntl(StatusFilters);
