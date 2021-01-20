import classnames from 'classnames';
import {FC, memo} from 'react';

interface RemoveMiniProps {
  className?: string;
}

const RemoveMini: FC<RemoveMiniProps> = memo(({className}: RemoveMiniProps) => (
  <svg className={classnames('icon', 'icon--remove-mini', className)} viewBox="0 0 8 8">
    <rect y="3.5" width="8" height="1" />
  </svg>
));

RemoveMini.defaultProps = {
  className: undefined,
};

export default RemoveMini;
