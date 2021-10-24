import classnames from 'classnames';
import {FC, ReactNode} from 'react';
import {useLingui} from '@lingui/react';

import Badge from '../general/Badge';
import Size from '../general/Size';

interface SidebarFilterProps {
  name: string;
  icon?: ReactNode;
  isActive: boolean;
  slug: string;
  count: number;
  size?: number;
  handleClick: (slug: string) => void;
}

const SidebarFilter: FC<SidebarFilterProps> = ({
  name: _name,
  icon,
  isActive,
  slug,
  count,
  size,
  handleClick,
}: SidebarFilterProps) => {
  const {i18n} = useLingui();

  const classNames = classnames('sidebar-filter__item', {
    'is-active': isActive,
    'queued': slug === 'downloading-queued' || slug === 'seeding-queued',
  });

  let name = _name;
  if (name === '') {
    name = i18n._('filter.all');
  } else if (name === 'untagged') {
    if (count === 0) {
      return null;
    }
    name = i18n._('filter.untagged');
  }

  if (slug === 'checking' || slug === 'error' || slug === 'downloading-queued' || slug === 'seeding-queued') {
    if (count === 0) {
      return null;
    }
  }

  return (
    <li>
      <button
        className={classNames}
        css={{
          ':focus': {
            outline: 'none',
            WebkitTapHighlightColor: 'transparent',
          },
        }}
        type="button"
        onClick={() => handleClick(slug)}
        role="menuitem"
      >
        {icon}
        <span className="name">{name}</span>
        <Badge>{count}</Badge>
        {size && <Size value={size} className="size" />}
      </button>
    </li>
  );
};

SidebarFilter.defaultProps = {
  icon: undefined,
  size: undefined,
};

export default SidebarFilter;
