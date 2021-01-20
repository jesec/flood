import classnames from 'classnames';
import {FC, memo} from 'react';

interface CloseProps {
  className?: string;
}

const Close: FC<CloseProps> = memo(({className}: CloseProps) => (
  <svg className={classnames('icon', 'icon--close', className)} viewBox="0 0 60 60">
    <polygon points="52.5 14.48 45.52 7.5 30 23.02 14.48 7.5 7.5 14.48 23.02 30 7.51 45.52 14.48 52.5 30 36.98 45.52 52.5 52.5 45.52 36.98 30 52.5 14.48" />
  </svg>
));

Close.defaultProps = {
  className: undefined,
};

export default Close;
