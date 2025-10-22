import classnames from 'classnames';
import {FC} from 'react';

interface LoadingIndicatorProps {
  inverse?: boolean;
}

const LoadingIndicator: FC<LoadingIndicatorProps> = ({inverse = true}: LoadingIndicatorProps) => {
  const classes = classnames('loading-indicator', {
    'is-inverse': inverse,
  });

  return (
    <div className={classes} key="loading-indicator">
      <div className="loading-indicator__bar loading-indicator__bar--1" />
      <div className="loading-indicator__bar loading-indicator__bar--2" />
      <div className="loading-indicator__bar loading-indicator__bar--3" />
    </div>
  );
};

export default LoadingIndicator;
