import React from 'react';

interface SidebarActionsProps {
  children: React.ReactNode;
}

const SidebarActions: React.FC<SidebarActionsProps> = ({children}: SidebarActionsProps) => {
  return <div className="sidebar__actions">{children}</div>;
};

export default SidebarActions;
