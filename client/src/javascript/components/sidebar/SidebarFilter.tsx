import classnames from 'classnames';
import {FC, ReactNode, KeyboardEvent, MouseEvent, RefObject, TouchEvent, useEffect, useRef, useState} from 'react';
import {useLingui} from '@lingui/react';

import {css} from '@client/styled-system/css';
import {Start} from '@client/ui/icons';

import Badge from '../general/Badge';
import Size from '../general/Size';

const focusStyle = css({
  _focus: {
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
});

const useRefTextOverflowed = (ref: RefObject<HTMLElement | null>, content: string) => {
  const [overflowed, setOverflowed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (element == null) return undefined;

    const updateOverflowed = () => {
      setOverflowed(element.scrollWidth > element.clientWidth);
    };
    const animationFrameId = window.requestAnimationFrame(updateOverflowed);
    const resizeObserver = new ResizeObserver(updateOverflowed);
    resizeObserver.observe(element);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [content, ref]);

  return overflowed;
};

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
  const nameSpanRef = useRef<HTMLSpanElement>(null);
  const {i18n} = useLingui();
  const [expanded, setExpanded] = useState(false);

  const classNames = classnames('sidebar-filter__item', {
    'is-active': isActive,
  });
  const expanderClassNames = classnames('sidebar-filter__expander', {
    'is-active': isActive,
    expanded: expanded,
  });

  let isHidden = false;
  let name = _name;
  if (name === '') {
    name = i18n._('filter.all');
  } else if (name === 'untagged') {
    if (count === 0) {
      isHidden = true;
    }
    name = i18n._('filter.untagged');
  }

  if (slug === 'checking' || slug === 'moving' || slug === 'error') {
    if (count === 0) {
      isHidden = true;
    }
  }

  const overflowed = useRefTextOverflowed(nameSpanRef, name);

  if (isHidden) return null;

  return (
    <li>
      <div className={children ? css({display: 'flex'}) : undefined}>
        {children && (
          <button
            className={`${expanderClassNames} ${focusStyle}`}
            type="button"
            onClick={() => setExpanded(!expanded)}
            role="switch"
            aria-checked={expanded}
          >
            <Start />
          </button>
        )}
        <button
          className={`${classNames} ${focusStyle}`}
          type="button"
          onClick={(event) => handleClick(slug, event)}
          role="menuitem"
        >
          {icon}
          <span className="name" ref={nameSpanRef} title={overflowed ? name || '' : undefined}>
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

export default SidebarFilter;
