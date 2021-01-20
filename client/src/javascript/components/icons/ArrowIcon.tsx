import classnames from 'classnames';
import {FC, memo} from 'react';

interface ArrowIconProps {
  className?: string;
}

const ArrowIcon: FC<ArrowIconProps> = memo(({className}: ArrowIconProps) => (
  <svg className={classnames('icon', 'icon--arrow', className)} viewBox="0 0 60 60">
    <path d="M25.78,42.22V1.16h8.43V42.22L48,27.77l6.1,5.83L30,58.84,5.87,33.6,12,27.77Z" />
  </svg>
));

ArrowIcon.defaultProps = {
  className: undefined,
};

export default ArrowIcon;
