import classnames from 'classnames';
import {FC, memo} from 'react';

interface CircleProps {
  className?: string;
}

const Circle: FC<CircleProps> = memo(({className}: CircleProps) => (
  <svg className={classnames('icon', 'icon--circle', className)} viewBox="0 0 60 60">
    <circle cx="30" cy="30" r="10" />
  </svg>
));

Circle.defaultProps = {
  className: undefined,
};

export default Circle;
