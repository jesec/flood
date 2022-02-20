import classnames from 'classnames';
import {FC, ReactNode, KeyboardEvent, MouseEvent, TouchEvent, useState} from 'react';
import {useLingui} from '@lingui/react';
import {Start} from '@client/ui/icons';

import Badge from '../general/Badge';
import Size from '../general/Size';

interface SidebarFilterProps {
  children?: ReactNode[];
  name: string;
  icon?: ReactNode;
  isActive: boolean;
  slug: string;
  count: number;
  size?: number;
  handleClick: (slug: string, event: KeyboardEvent | MouseEvent | TouchEvent) => void;
}

const SidebarFilter: FC<SidebarFilterProps> = ({
  children,
  name: _name,
  icon,
  isActive,
  slug,
  count,
  size,
  handleClick,
}: SidebarFilterProps) => {
  const {i18n} = useLingui();

  const [expanded, setExpanded] = useState(false);

  const classNames = classnames('sidebar-filter__item', {
    'is-active': isActive,
  });
  const expanderClassNames = classnames('sidebar-filter__expander', {
    'is-active': isActive,
    expanded: expanded,
  });

  const flexCss = children
    ? {
        display: 'flex',
      }
    : {};
  const focusCss = {
    ':focus': {
      outline: 'none',
      WebkitTapHighlightColor: 'transparent',
    },
  };

  let name = _name;
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

  const setTitleForOverflowedName = (event: MouseEvent) => {
    const target = event.target as HTMLSpanElement;
    const overflowed = target.scrollWidth > target.clientWidth;
    target.title = overflowed ? target.textContent || '' : '';
  };

  const unsetTitle = (event: MouseEvent) => {
    const target = event.target as HTMLSpanElement;
    target.title = '';
  };

  return (
    <li>
      <div css={flexCss}>
        {children && (
          <button
            className={expanderClassNames}
            css={focusCss}
            type="button"
            onClick={() => setExpanded(!expanded)}
            role="switch"
            aria-checked={expanded}
          >
            <Start />
          </button>
        )}
        <button
          className={classNames}
          css={focusCss}
          type="button"
          onClick={(event) => handleClick(slug, event)}
          role="menuitem"
        >
          {icon}
          <span className="name" onMouseOver={setTitleForOverflowedName} onMouseOut={unsetTitle}>
            {name}
          </span>
          <Badge>{count}</Badge>
          {size != null && <Size value={size} className="size" />}
        </button>
      </div>
      {children && expanded && <ul className="sidebar-filter__nested">{children}</ul>}
    </li>
  );
};

SidebarFilter.defaultProps = {
  icon: undefined,
  size: undefined,
};

export default SidebarFilter;
