import classnames from 'classnames';
import {FC, ReactNode} from 'react';

interface ApplicationViewProps {
  children: ReactNode;
  modifier?: string;
}

const ApplicationView: FC<ApplicationViewProps> = (props: ApplicationViewProps) => {
  const {children, modifier} = props;

  const classes = classnames('application__view', {
    [`application__view--${modifier}`]: modifier != null,
  });

  return <div className={classes}>{children}</div>;
};

ApplicationView.defaultProps = {
  modifier: undefined,
};

export default ApplicationView;
