import classnames from 'classnames';
import {FC, memo} from 'react';

interface RemoveProps {
  className?: string;
}

const Remove: FC<RemoveProps> = memo(({className}: RemoveProps) => (
  <svg className={classnames('icon', 'icon--remove', className)} viewBox="0 0 60 60">
    <path d="M53.7,25.3H6.3v9.4h47.4" />
  </svg>
));

Remove.defaultProps = {
  className: undefined,
};

export default Remove;
