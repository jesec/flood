import classnames from 'classnames';
import {FC, ReactNode} from 'react';

interface ApplicationContentProps {
  children: ReactNode;
  baseClassName?: string;
  className: string;
  modifier: string;
}

const ApplicationContent: FC<ApplicationContentProps> = (props: ApplicationContentProps) => {
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
