import classnames from 'classnames';
import {FC, MouseEventHandler, ReactNode} from 'react';

interface ContextMenuItemProps {
  children: ReactNode;
  className?: string;
  onClick: MouseEventHandler;
}

const ContextMenuItem: FC<ContextMenuItemProps> = ({children, className, onClick}: ContextMenuItemProps) => {
  const classes = classnames('context-menu__item', className);

  return (
    <button
      className={classes}
      css={{
        width: '100%',
        textAlign: 'left',
        ':focus': {
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
        },
      }}
      type="button"
      onClick={onClick}>
      {children}
    </button>
  );
};

ContextMenuItem.defaultProps = {
  className: undefined,
};

export default ContextMenuItem;
