import {FC, useState} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';

import {Active, All, Completed, DownloadSmall, Error, Inactive, Stop, Spinner, UploadSmall} from '@client/ui/icons';
import TorrentFilterStore from '@client/stores/TorrentFilterStore';

import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

import SidebarFilter from './SidebarFilter';
import Expando from './Expando';

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
      label: i18n._('filter.status.seeding'),
      slug: 'seeding',
      icon: <UploadSmall />,
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
      handleClick={(selection, event) => TorrentFilterStore.setStatusFilters(selection as TorrentStatus, event)}
      count={TorrentFilterStore.taxonomy.statusCounts[filter.slug] || 0}
      key={filter.slug}
      icon={filter.icon}
      isActive={
        (filter.slug === '' && !TorrentFilterStore.statusFilter.length) ||
        TorrentFilterStore.statusFilter.includes(filter.slug as TorrentStatus)
      }
      name={filter.label}
      slug={filter.slug}
    />
  ));

  const title = i18n._('filter.status.title');

  const [expanded, setExpanded] = useState<boolean>(true);
  const expandoClick = () => {
    setExpanded(!expanded);
  };

  return (
    <ul aria-label={title} className="sidebar-filter sidebar__item" role="menu">
      <li className="sidebar-filter__item" role="none">
        <Expando className="sidebar-filter__item--heading" expanded={expanded} handleClick={expandoClick}>
          {title}
        </Expando>
      </li>
      {expanded && filterElements}
    </ul>
  );
});

export default StatusFilters;
