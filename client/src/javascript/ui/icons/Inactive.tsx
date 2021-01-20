import classnames from 'classnames';
import {FC, memo} from 'react';

interface InactiveProps {
  className?: string;
}

const Inactive: FC<InactiveProps> = memo(({className}: InactiveProps) => (
  <svg className={classnames('icon', 'icon--inactive', className)} viewBox="0 0 60 60">
    <path d="M56,52H42l-9.7-12.5l-11,4.8L13,20.7l-7,4l-2-9.9L17.2,8l9.5,24.4l9.6-4.3l10.9,15.4H56V52z" />
  </svg>
));

Inactive.defaultProps = {
  className: undefined,
};

export default Inactive;
