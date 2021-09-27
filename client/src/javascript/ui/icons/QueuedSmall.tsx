import classnames from 'classnames';
import {FC, memo} from 'react';

interface QueuedSmallProps {
  className?: string;
}

const QueuedSmall: FC<QueuedSmallProps> = memo(({className}: QueuedSmallProps) => (
  <svg className={classnames('icon', 'icon--queued-small', className)} viewBox="0 0 60 60">
    <path d="M6,2V8H6V8L10,12L6,16V16H6V22H18V16H18V16L14,12L18,8V8H18V2H6Z" />
  </svg>
));

QueuedSmall.defaultProps = {
  className: undefined,
};

export default QueuedSmall;
