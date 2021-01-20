import classnames from 'classnames';
import {FC, memo} from 'react';

interface StopProps {
  className?: string;
}

const Stop: FC<StopProps> = memo(({className}: StopProps) => (
  <svg className={classnames('icon', 'icon--stop', className)} viewBox="0 0 60 60">
    <path d="M11.9 11.9H48v36.2H11.9V11.9z" />
  </svg>
));

Stop.defaultProps = {
  className: undefined,
};

export default Stop;
