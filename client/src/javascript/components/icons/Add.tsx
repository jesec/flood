import classnames from 'classnames';
import {FC, memo} from 'react';

interface AddProps {
  className?: string;
}

const Add: FC<AddProps> = memo(({className}: AddProps) => (
  <svg className={classnames('icon', 'icon--add', className)} viewBox="0 0 60 60">
    <path d="M53.7 25.3h-19v-19h-9.4v19h-19v9.4h19v19h9.4v-19h19" />
  </svg>
));

Add.defaultProps = {
  className: undefined,
};

export default Add;
