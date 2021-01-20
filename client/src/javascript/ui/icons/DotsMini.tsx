import classnames from 'classnames';
import {FC, memo} from 'react';

interface DotsMiniProps {
  className?: string;
}

const DotsMini: FC<DotsMiniProps> = memo(({className}: DotsMiniProps) => (
  <svg className={classnames('icon', 'icon--dots-mini', className)} viewBox="0 0 60 60">
    <circle cx="0.9" cy="4" r="0.9" />
    <circle cx="4" cy="4" r="0.9" />
    <circle cx="7.1" cy="4" r="0.9" />
  </svg>
));

DotsMini.defaultProps = {
  className: undefined,
};

export default DotsMini;
