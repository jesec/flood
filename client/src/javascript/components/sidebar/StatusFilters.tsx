import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import Active from '../icons/Active';
import All from '../icons/All';
import Completed from '../icons/Completed';
import connectStores from '../../util/connectStores';
import DownloadSmall from '../icons/DownloadSmall';
import ErrorIcon from '../icons/ErrorIcon';
import Inactive from '../icons/Inactive';
import SidebarFilter from './SidebarFilter';
import StopIcon from '../icons/StopIcon';
import SpinnerIcon from '../icons/SpinnerIcon';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import UIActions from '../../actions/UIActions';
import UploadSmall from '../icons/UploadSmall';

interface StatusFiltersProps extends WrappedComponentProps {
  statusCount?: Record<string, number>;
  statusFilter?: string;
}

class StatusFilters extends React.Component<StatusFiltersProps> {
  handleClick(filter: string) {
    UIActions.setTorrentStatusFilter(filter);
  }

  getFilters() {
    const filters = [
      {
        label: this.props.intl.formatMessage({
          id: 'filter.all',
        }),
        slug: 'all',
        icon: <All />,
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.downloading',
        }),
        slug: 'downloading',
        icon: <DownloadSmall />,
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.seeding',
        }),
        slug: 'seeding',
        icon: <UploadSmall />,
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.checking',
        }),
        slug: 'checking',
        icon: <SpinnerIcon />,
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.completed',
        }),
        slug: 'complete',
        icon: <Completed />,
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.stopped',
        }),
        slug: 'stopped',
        icon: <StopIcon />,
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.active',
        }),
        slug: 'active',
        icon: <Active />,
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.inactive',
        }),
        slug: 'inactive',
        icon: <Inactive />,
      },
      {
        label: this.props.intl.formatMessage({
          id: 'filter.status.error',
        }),
        slug: 'error',
        icon: <ErrorIcon />,
      },
    ];

    const filterElements = filters.map((filter) => (
      <SidebarFilter
        handleClick={this.handleClick}
        count={(this.props.statusCount != null && this.props.statusCount[filter.slug]) || 0}
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
          <FormattedMessage id="filter.status.title" />
        </li>
        {filters}
      </ul>
    );
  }
}

const ConnectedStatusFilters = connectStores<Omit<StatusFiltersProps, 'intl'>>(injectIntl(StatusFilters), () => {
  return [
    {
      store: TorrentFilterStore,
      event: 'CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS',
      getValue: ({store}) => {
        const storeTorrentFilter = store as typeof TorrentFilterStore;
        return {
          statusCount: storeTorrentFilter.getTorrentStatusCount(),
        };
      },
    },
    {
      store: TorrentFilterStore,
      event: 'UI_TORRENTS_FILTER_STATUS_CHANGE',
      getValue: ({store}) => {
        const storeTorrentFilter = store as typeof TorrentFilterStore;
        return {
          statusFilter: storeTorrentFilter.getStatusFilter(),
        };
      },
    },
  ];
});

export default ConnectedStatusFilters;
