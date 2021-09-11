import classnames from 'classnames';
import {FC, memo} from 'react';

interface CircleProps {
  className?: string;
}

const Circle: FC<CircleProps> = memo(({className}: CircleProps) => (
  <svg
    className={classnames('icon', 'icon--circle', className)}
    width="18"
    height="18"
    viewBox="0 0 18 18"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="9" cy="9" r="4" />
  </svg>
));

Circle.defaultProps = {
  className: undefined,
};

export default Circle;
