import classnames from 'classnames';
import {FC} from 'react';
import {useLingui} from '@lingui/react';

import Badge from '../general/Badge';

interface SidebarFilterProps {
  name: string;
  icon?: JSX.Element;
  isActive: boolean;
  slug: string;
  count: number;
  handleClick: (slug: string) => void;
}

const SidebarFilter: FC<SidebarFilterProps> = (props: SidebarFilterProps) => {
  const {isActive, count, slug, icon, handleClick} = props;
  const {i18n} = useLingui();

  const classNames = classnames('sidebar-filter__item', {
    'is-active': isActive,
  });
  let {name} = props;

  if (name === '') {
    name = i18n._('filter.all');
  } else if (name === 'untagged') {
    if (count === 0) {
      return null;
    }
    name = i18n._('filter.untagged');
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
