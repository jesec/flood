import classnames from 'classnames';
import {EventHandler, FC, ReactNode, SyntheticEvent} from 'react';

import {css} from '@client/styled-system/css';

interface ContextMenuItemProps {
  children: ReactNode;
  className?: string;
  onClick: EventHandler<SyntheticEvent>;
}

const ContextMenuItem: FC<ContextMenuItemProps> = ({children, className, onClick}: ContextMenuItemProps) => {
  const classes = classnames('context-menu__item', className);

  return (
    <div
      className={`${classes} ${css({
        width: '100%',
        textAlign: 'left',
        _focus: {
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
        },
      })}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyPress={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onClick?.(e);
        }
      }}
    >
      {children}
    </div>
  );
};

ContextMenuItem.defaultProps = {
  className: undefined,
};

export default ContextMenuItem;
