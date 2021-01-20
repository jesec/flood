import classnames from 'classnames';
import {FC, memo} from 'react';

interface ChevronLeftProps {
  className?: string;
}

const ChevronLeft: FC<ChevronLeftProps> = memo(({className}: ChevronLeftProps) => (
  <svg className={classnames('icon', 'icon--chevron-left', className)} viewBox="0 0 60 60">
    <polygon points="41.34 1.2 47.35 7.21 24.6 29.96 47.42 52.79 41.41 58.8 12.58 29.96 41.34 1.2" />
  </svg>
));

ChevronLeft.defaultProps = {
  className: undefined,
};

export default ChevronLeft;
