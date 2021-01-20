import classnames from 'classnames';
import {FC, memo} from 'react';

interface CheckmarkProps {
  className?: string;
}

const Checkmark: FC<CheckmarkProps> = memo(({className}: CheckmarkProps) => (
  <svg className={classnames('icon', 'icon--checkmark', className)} viewBox="0 0 60 60">
    <polygon points="55.5,18.6 46.1,8.7 24.4,31.5 13.9,20.4 4.5,30.3 24.4,51.3 24.4,51.3 24.4,51.3" />
  </svg>
));

Checkmark.defaultProps = {
  className: undefined,
};

export default Checkmark;
