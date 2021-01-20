import classnames from 'classnames';
import {FC, memo} from 'react';

interface DetailNotAvailableIconProps {
  className?: string;
}

const DetailNotAvailableIcon: FC<DetailNotAvailableIconProps> = memo(({className}: DetailNotAvailableIconProps) => (
  <svg className={classnames('icon', 'icon--clock', className)} viewBox="0 0 60 60">
    <rect y="26.63" width="60" height="6.75" />
  </svg>
));

DetailNotAvailableIcon.defaultProps = {
  className: undefined,
};

export default DetailNotAvailableIcon;
