import classnames from 'classnames';
import {useIntl} from 'react-intl';
import * as React from 'react';

import Badge from '../general/Badge';

interface SidebarFilterProps {
  name: string;
  icon?: JSX.Element;
  isActive: boolean;
  slug: string;
  count: number;
  handleClick: (slug: string) => void;
}

const SidebarFilter: React.FC<SidebarFilterProps> = (props: SidebarFilterProps) => {
  const {isActive, count, slug, icon, handleClick} = props;
  const intl = useIntl();

  const classNames = classnames('sidebar-filter__item', {
    'is-active': isActive,
  });
  let {name} = props;

  if (name === '') {
    name = intl.formatMessage({
      id: 'filter.all',
    });
  } else if (name === 'untagged') {
    if (count === 0) {
      return null;
    }
    name = intl.formatMessage({
      id: 'filter.untagged',
    });
  }

  if (slug === 'checking' || slug === 'error') {
    if (count === 0) {
      return null;
    }
  }

  return (
    <li className={classNames} onClick={() => handleClick(slug)}>
      {icon}
      {name}
      <Badge>{count}</Badge>
    </li>
  );
};

SidebarFilter.defaultProps = {
  icon: undefined,
};

export default SidebarFilter;
