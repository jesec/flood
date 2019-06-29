import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import Active from '../icons/Active';
import All from '../icons/All';
import Completed from '../icons/Completed';
import connectStores from '../../util/connectStores';
import DownloadSmall from '../icons/DownloadSmall';
import ErrorIcon from '../icons/ErrorIcon';
import EventTypes from '../../constants/EventTypes';
import Inactive from '../icons/Inactive';
import SidebarFilter from './SidebarFilter';
import StopIcon from '../icons/StopIcon';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import UIActions from '../../actions/UIActions';

class StatusFilters extends React.Component {
  handleClick(filter) {
    UIActions.setTorrentStatusFilter(filter);
  }

  getFilters() {
    const filters = [
      {
        label: this.props.intl.formatMessage({
          id: 'filter.all',
          defaultMessage: 'All',
        }),
        slug: 'all',
        icon: <All />,
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.downloading',
          defaultMessage: 'Downloading',
        }),
        slug: 'downloading',
        icon: <DownloadSmall />,
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.completed',
          defaultMessage: 'Complete',
        }),
        slug: 'complete',
        icon: <Completed />,
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.stopped',
          defaultMessage: 'Stopped',
        }),
        slug: 'stopped',
        icon: <StopIcon />,
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.active',
          defaultMessage: 'All',
        }),
        slug: 'active',
        icon: <Active />,
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.inactive',
          defaultMessage: 'Inactive',
        }),
        slug: 'inactive',
        icon: <Inactive />,
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.error',
          defaultMessage: 'Error',
        }),
        slug: 'error',
        icon: <ErrorIcon />,
      },
    ];

    const filterElements = filters.map(filter => (
      <SidebarFilter
        handleClick={this.handleClick}
        count={this.props.statusCount[filter.slug] || 0}
        key={filter.slug}
        icon={filter.icon}
        isActive={filter.slug === this.props.statusFilter}
        name={filter.label}
        slug={filter.slug}
      />
    ));

    return filterElements;
  }

  render() {
    const filters = this.getFilters();

    return (
      <ul className="sidebar-filter sidebar__item">
        <li className="sidebar-filter__item sidebar-filter__item--heading">
          <FormattedMessage id="filter.status.title" defaultMessage="Filter by Status" />
        </li>
        {filters}
      </ul>
    );
  }
}

const ConnectedStatusFilters = connectStores(injectIntl(StatusFilters), () => {
  return [
    {
      store: TorrentFilterStore,
      event: EventTypes.CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS,
      getValue: ({store}) => {
        return {
          statusCount: store.getTorrentStatusCount(),
        };
      },
    },
    {
      store: TorrentFilterStore,
      event: EventTypes.UI_TORRENTS_FILTER_STATUS_CHANGE,
      getValue: ({store}) => {
        return {
          statusFilter: store.getStatusFilter(),
        };
      },
    },
  ];
});

export default ConnectedStatusFilters;
