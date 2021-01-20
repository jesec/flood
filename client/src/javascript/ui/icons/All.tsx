import classnames from 'classnames';
import {FC, memo} from 'react';

interface AllProps {
  className?: string;
}

const All: FC<AllProps> = memo(({className}: AllProps) => (
  <svg className={classnames('icon', 'icon--all', className)} viewBox="0 0 60 60">
    <polygon points="52,20.6 48.6,14.7 33.4,24 33.4,8.7 26.6,8.7 26.6,24 11.4,14.7 8,20.6 23.4,30 8,39.4 11.4,45.3 26.6,36 26.6,51.3 33.4,51.3 33.4,36 48.6,45.3 52,39.4 36.6,30 " />
  </svg>
));

All.defaultProps = {
  className: undefined,
};

export default All;
