import * as React from 'react';

interface BadgeProps {
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({children}: BadgeProps) => {
  return <div className="badge">{children}</div>;
};

export default Badge;
