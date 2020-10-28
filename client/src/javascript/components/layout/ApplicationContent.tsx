import * as React from 'react';

interface ApplicationContentProps {
  children: React.ReactNode;
}

const ApplicationContent: React.FC<ApplicationContentProps> = ({children}: ApplicationContentProps) => {
  return <div className="application__content">{children}</div>;
};

export default ApplicationContent;
