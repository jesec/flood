import {FC} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';

import {Active, All, Completed, DownloadSmall, Queued, Error, Inactive, Stop, Spinner, UploadSmall} from '@client/ui/icons';
import TorrentFilterStore from '@client/stores/TorrentFilterStore';
import UIActions from '@client/actions/UIActions';

import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

import SidebarFilter from './SidebarFilter';

const StatusFilters: FC = observer(() => {
  const {i18n} = useLingui();

  const filters: Array<{
    label: string;
    slug: TorrentStatus | '';
    icon: JSX.Element;
  }> = [
    {
      label: i18n._('filter.all'),
      slug: '',
      icon: <All />,
    },
    {
      label: i18n._('filter.status.downloading'),
      slug: 'downloading',
      icon: <DownloadSmall />,
    },
    {
      label: i18n._('filter.status.queued'),
      slug: 'downloading-queued',
      icon: <Queued />,
    },
    {
      label: i18n._('filter.status.seeding'),
      slug: 'seeding',
      icon: <UploadSmall />,
    },
    {
      label: i18n._('filter.status.queued'),
      slug: 'seeding-queued',
      icon: <Queued />,
    },
    {
      label: i18n._('filter.status.checking'),
      slug: 'checking',
      icon: <Spinner />,
    },
    {
      label: i18n._('filter.status.completed'),
      slug: 'complete',
      icon: <Completed />,
    },
    {
      label: i18n._('filter.status.stopped'),
      slug: 'stopped',
      icon: <Stop />,
    },
    {
      label: i18n._('filter.status.active'),
      slug: 'active',
      icon: <Active />,
    },
    {
      label: i18n._('filter.status.inactive'),
      slug: 'inactive',
      icon: <Inactive />,
    },
    {
      label: i18n._('filter.status.error'),
      slug: 'error',
      icon: <Error />,
    },
  ];

  const filterElements = filters.map((filter) => (
    <SidebarFilter
      handleClick={(selection) => UIActions.setTorrentStatusFilter(selection as TorrentStatus)}
      count={TorrentFilterStore.taxonomy.statusCounts[filter.slug] - (filter.slug === 'downloading' || filter.slug === 'seeding' ? TorrentFilterStore.taxonomy.statusCounts[filter.slug + '-queued'] || 0 : 0) || 0}
      key={filter.slug}
      icon={filter.icon}
      isActive={filter.slug === TorrentFilterStore.filters.statusFilter}
      name={filter.label}
      slug={filter.slug}
    />
  ));

  const title = i18n._('filter.status.title');

  return (
    <ul aria-label={title} className="sidebar-filter sidebar__item" role="menu">
      <li className="sidebar-filter__item sidebar-filter__item--heading" role="none">
        {title}
      </li>
      {filterElements}
    </ul>
  );
});

export default StatusFilters;
