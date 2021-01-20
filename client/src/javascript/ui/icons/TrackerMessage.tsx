import classnames from 'classnames';
import {FC, memo} from 'react';

interface TrackerMessageProps {
  className?: string;
}

const TrackerMessage: FC<TrackerMessageProps> = memo(({className}: TrackerMessageProps) => (
  <svg className={classnames('icon', 'icon--seeds', className)} viewBox="0 0 60 60">
    <circle cx="11.08" cy="30" r="5.94" />
    <circle cx="30" cy="30" r="5.94" />
    <circle cx="48.92" cy="30" r="5.94" />
  </svg>
));

TrackerMessage.defaultProps = {
  className: undefined,
};

export default TrackerMessage;
