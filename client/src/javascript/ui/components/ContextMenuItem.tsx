import classnames from 'classnames';
import {FC, MouseEventHandler, ReactNode} from 'react';

interface ContextMenuItemProps {
  children: ReactNode;
  className?: string;
  onClick: MouseEventHandler<HTMLDivElement>;
}

const ContextMenuItem: FC<ContextMenuItemProps> = ({children, className, onClick}: ContextMenuItemProps) => {
  const classes = classnames('context-menu__item', className);

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

ContextMenuItem.defaultProps = {
  className: undefined,
};

export default ContextMenuItem;
