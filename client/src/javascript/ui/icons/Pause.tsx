import classnames from 'classnames';
import {FC, memo} from 'react';

interface StartProps {
  className?: string;
}

const Start: FC<StartProps> = memo(({className}: StartProps) => (
  <svg className={classnames('icon', 'icon--start', className)} viewBox="0 0 64 64">
    <path d="M10 12 L24 12 L24 52 L10 52 M52 12 L38 12 L38 52 L52 52" />
  </svg>
));

Start.defaultProps = {
  className: undefined,
};

export default Start;
