import classnames from 'classnames';
import {FC, memo} from 'react';

interface QueuedProps {
  className?: string;
}

const Queued: FC<QueuedProps> = memo(({className}: QueuedProps) => (
  <svg className={classnames('icon', 'icon--queued', className)} viewBox="0 0 60 60">
    <path d="M15,5V20H15V20L25,30L15,40V40H15V55H45V40H45V40L35,30L45,20V20H45V5H15Z" />
  </svg>
));

Queued.defaultProps = {
  className: undefined,
};

export default Queued;
