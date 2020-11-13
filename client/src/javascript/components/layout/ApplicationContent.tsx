import {FC, ReactNode} from 'react';

interface ApplicationContentProps {
  children: ReactNode;
}

const ApplicationContent: FC<ApplicationContentProps> = ({children}: ApplicationContentProps) => {
  return <div className="application__content">{children}</div>;
};

export default ApplicationContent;
