import classnames from 'classnames';
import * as React from 'react';

interface ApplicationContentProps {
  children: React.ReactNode;
  baseClassName?: string;
  className: string;
  modifier: string;
}

const ApplicationContent: React.FC<ApplicationContentProps> = (props: ApplicationContentProps) => {
  const {children, baseClassName, className, modifier} = props;

  const classes = classnames(baseClassName, {
    [`${baseClassName}--${modifier}`]: baseClassName,
    [className]: className,
  });

  return <div className={classes}>{children}</div>;
};

ApplicationContent.defaultProps = {
  baseClassName: 'application__panel',
};

export default ApplicationContent;
