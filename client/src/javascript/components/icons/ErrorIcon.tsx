import classnames from 'classnames';
import {FC, memo} from 'react';

interface ErrorProps {
  className?: string;
}

const Error: FC<ErrorProps> = memo(({className}: ErrorProps) => (
  <svg className={classnames('icon', 'icon--error', className)} viewBox="0 0 60 60">
    <path d="M34.3,51.3h-8.5v-9h8.5V51.3z M34.3,36.4h-8.5L23.6,8.7h12.7L34.3,36.4z" />
  </svg>
));

Error.defaultProps = {
  className: undefined,
};

export default Error;
