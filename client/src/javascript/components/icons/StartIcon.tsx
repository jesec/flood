import classnames from 'classnames';
import {FC, memo} from 'react';

interface StartProps {
  className?: string;
}

const Start: FC<StartProps> = memo(({className}: StartProps) => (
  <svg className={classnames('icon', 'icon--start', className)} viewBox="0 0 60 60">
    <path d="M13.1 9.5L46.9 30 13.1 50.5v-41z" />
  </svg>
));

Start.defaultProps = {
  className: undefined,
};

export default Start;
