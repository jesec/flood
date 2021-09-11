import classnames from 'classnames';
import {EventHandler, FC, ReactNode, SyntheticEvent} from 'react';

interface ContextMenuItemProps {
  children: ReactNode;
  className?: string;
  onClick: EventHandler<SyntheticEvent>;
}

const ContextMenuItem: FC<ContextMenuItemProps> = ({children, className, onClick}: ContextMenuItemProps) => {
  const classes = classnames('context-menu__item', className);

  return (
    <div
      className={classes}
      role="button"
      css={{
        width: '100%',
        textAlign: 'left',
        ':focus': {
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
        },
      }}
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
