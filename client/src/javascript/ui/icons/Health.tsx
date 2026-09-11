import classnames from 'classnames';
import {FC, memo} from 'react';

interface HealthProps {
  className?: string;
}

const Health: FC<HealthProps> = memo(({className}: HealthProps = {}) => (
  <svg className={classnames('icon', 'icon--health', className)} viewBox="0 0 60 60">
    <path d="M30,55.5c-1.1,0-2.2-0.4-3-1.2L7.3,34.5c-6.4-6.4-6.4-16.9,0-23.3c3.1-3.1,7.3-4.8,11.7-4.8s8.5,1.7,11.7,4.8 l2.3,2.3l2.3-2.3c3.1-3.1,7.3-4.8,11.7-4.8s8.5,1.7,11.7,4.8c6.4,6.4,6.4,16.9,0,23.3L33,54.3C32.2,55.1,31.1,55.5,30,55.5z" />
  </svg>
));

export default Health;
