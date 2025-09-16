import classnames from 'classnames';
import {FC, ReactNode} from 'react';

interface ApplicationContentProps {
  children: ReactNode;
  baseClassName?: string;
  className: string;
  modifier: string;
}

const ApplicationContent: FC<ApplicationContentProps> = ({
  children,
  baseClassName = 'application__panel',
  className,
  modifier,
}: ApplicationContentProps) => {
  const classes = classnames(baseClassName, {
    [`${baseClassName}--${modifier}`]: baseClassName,
    [className]: className,
  });

  return <div className={classes}>{children}</div>;
};

export default ApplicationContent;
