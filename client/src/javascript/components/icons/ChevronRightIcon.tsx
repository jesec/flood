import classnames from 'classnames';
import {FC, memo} from 'react';

interface ChevronRightIconProps {
  className?: string;
}

const ChevronRightIcon: FC<ChevronRightIconProps> = memo(({className}: ChevronRightIconProps) => (
  <svg className={classnames('icon', 'icon--chevron-right', className)} viewBox="0 0 60 60">
    <polygon points="18.66 58.8 12.65 52.79 35.4 30.04 12.58 7.21 18.59 1.2 47.42 30.04 18.66 58.8" />
  </svg>
));

ChevronRightIcon.defaultProps = {
  className: undefined,
};

export default ChevronRightIcon;
