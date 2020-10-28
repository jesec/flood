import classnames from 'classnames';
import * as React from 'react';

interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({children}: ContainerProps) => {
  const classes = classnames('container');
  return <div className={classes}>{children}</div>;
};

export default Container;
