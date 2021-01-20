import classnames from 'classnames';
import {FC, memo} from 'react';

interface RadioDotProps {
  className?: string;
}

const RadioDot: FC<RadioDotProps> = memo(({className}: RadioDotProps) => (
  <svg className={classnames('icon', 'icon--radio', className)} viewBox="0 0 60 60">
    <circle cx="30" cy="30" r="20" />
  </svg>
));

RadioDot.defaultProps = {
  className: undefined,
};

export default RadioDot;
