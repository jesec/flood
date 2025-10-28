import classnames from 'classnames';
import {FC, ReactNode} from 'react';

interface SidebarItemProps {
  children: ReactNode;
  baseClassName?: string;
  modifier: string;
}

const SidebarItem: FC<SidebarItemProps> = ({children, baseClassName = 'sidebar__item', modifier}: SidebarItemProps) => {
  const classes = classnames(baseClassName, {
    [`${baseClassName}--${modifier}`]: modifier,
  });

  return <div className={classes}>{children}</div>;
};

export default SidebarItem;
