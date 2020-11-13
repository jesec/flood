import {FC} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {observer} from 'mobx-react';

import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

import Active from '../icons/Active';
import All from '../icons/All';
import Completed from '../icons/Completed';
import DownloadSmall from '../icons/DownloadSmall';
import ErrorIcon from '../icons/ErrorIcon';
import Inactive from '../icons/Inactive';
import SidebarFilter from './SidebarFilter';
import StopIcon from '../icons/StopIcon';
import SpinnerIcon from '../icons/SpinnerIcon';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import UIActions from '../../actions/UIActions';
import UploadSmall from '../icons/UploadSmall';

const StatusFilters: FC = observer(() => {
  const intl = useIntl();

  const filters: Array<{
    label: string;
    slug: TorrentStatus | '';
    icon: JSX.Element;
  }> = [
    {
      label: intl.formatMessage({
        id: 'filter.all',
      }),
      slug: '',
      icon: <All />,
    },
    {
      label: intl.formatMessage({
        id: 'filter.status.downloading',
      }),
      slug: 'downloading',
      icon: <DownloadSmall />,
    },
    {
      label: intl.formatMessage({
        id: 'filter.status.seeding',
      }),
      slug: 'seeding',
      icon: <UploadSmall />,
    },
    {
      label: intl.formatMessage({
        id: 'filter.status.checking',
      }),
      slug: 'checking',
      icon: <SpinnerIcon />,
    },
    {
      label: intl.formatMessage({
        id: 'filter.status.completed',
      }),
      slug: 'complete',
      icon: <Completed />,
    },
    {
      label: intl.formatMessage({
        id: 'filter.status.stopped',
      }),
      slug: 'stopped',
      icon: <StopIcon />,
    },
    {
      label: intl.formatMessage({
        id: 'filter.status.active',
      }),
      slug: 'active',
      icon: <Active />,
    },
    {
      label: intl.formatMessage({
        id: 'filter.status.inactive',
      }),
      slug: 'inactive',
      icon: <Inactive />,
    },
    {
      label: intl.formatMessage({
        id: 'filter.status.error',
      }),
      slug: 'error',
      icon: <ErrorIcon />,
    },
  ];

  const filterElements = filters.map((filter) => (
    <SidebarFilter
      handleClick={(selection) => UIActions.setTorrentStatusFilter(selection as TorrentStatus)}
      count={TorrentFilterStore.taxonomy.statusCounts[filter.slug] || 0}
      key={filter.slug}
      icon={filter.icon}
      isActive={filter.slug === TorrentFilterStore.filters.statusFilter}
      name={filter.label}
      slug={filter.slug}
    />
  ));

  return (
    <ul className="sidebar-filter sidebar__item">
      <li className="sidebar-filter__item sidebar-filter__item--heading">
        <FormattedMessage id="filter.status.title" />
      </li>
      {filterElements}
    </ul>
  );
});

export default StatusFilters;
