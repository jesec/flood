import classnames from 'classnames';
import {FC, memo} from 'react';

interface TrackerMessageIconProps {
  className?: string;
}

const TrackerMessageIcon: FC<TrackerMessageIconProps> = memo(({className}: TrackerMessageIconProps) => (
  <svg className={classnames('icon', 'icon--seeds', className)} viewBox="0 0 60 60">
    <circle cx="11.08" cy="30" r="5.94" />
    <circle cx="30" cy="30" r="5.94" />
    <circle cx="48.92" cy="30" r="5.94" />
  </svg>
));

TrackerMessageIcon.defaultProps = {
  className: undefined,
};

export default TrackerMessageIcon;
