import classnames from 'classnames';
import {FC} from 'react';

interface LoadingIndicatorProps {
  inverse?: boolean;
}

const LoadingIndicator: FC<LoadingIndicatorProps> = (props: LoadingIndicatorProps) => {
  const {inverse} = props;

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

LoadingIndicator.defaultProps = {
  inverse: true,
};

export default LoadingIndicator;
