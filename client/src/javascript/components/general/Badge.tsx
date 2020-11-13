import {FC, ReactNode} from 'react';

interface BadgeProps {
  children: ReactNode;
}

const Badge: FC<BadgeProps> = ({children}: BadgeProps) => {
  return <div className="badge">{children}</div>;
};

export default Badge;
