import {FC, ReactNode} from 'react';

interface SidebarActionsProps {
  children: ReactNode;
}

const SidebarActions: FC<SidebarActionsProps> = ({children}: SidebarActionsProps) => (
  <div className="sidebar__actions">{children}</div>
);

export default SidebarActions;
