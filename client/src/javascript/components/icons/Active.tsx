import classnames from 'classnames';
import {FC, memo} from 'react';

interface ActiveProps {
  className?: string;
}

const Active: FC<ActiveProps> = memo(({className}: ActiveProps) => (
  <svg className={classnames('icon', 'icon--active', className)} viewBox="0 0 60 60">
    <path d="M25.7,25.7H13v17.4H2.6L19.3,60L36,43.1H25.7V25.7z M40.7,0L24,16.9h10.3v17.4H47V16.9h10.3L40.7,0z" />
  </svg>
));

Active.defaultProps = {
  className: undefined,
};

export default Active;
