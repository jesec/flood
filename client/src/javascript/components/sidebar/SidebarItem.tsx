import classnames from 'classnames';
import React from 'react';

interface SidebarItemProps {
  children: React.ReactNode;
  baseClassName?: string;
  modifier: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({children, baseClassName, modifier}: SidebarItemProps) => {
  const classes = classnames(baseClassName, {
    [`${baseClassName}--${modifier}`]: modifier,
  });

  return <div className={classes}>{children}</div>;
};

SidebarItem.defaultProps = {
  baseClassName: 'sidebar__item',
};

export default SidebarItem;
