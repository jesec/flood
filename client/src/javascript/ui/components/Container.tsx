import classnames from 'classnames';
import {FC, ReactNode} from 'react';

interface ContainerProps {
  children: ReactNode;
}

const Container: FC<ContainerProps> = ({children}: ContainerProps) => {
  const classes = classnames('container');
  return <div className={classes}>{children}</div>;
};

export default Container;
