import classnames from 'classnames';
import {FC, memo} from 'react';

interface CheckmarkProps {
  className?: string;
}

const Checkmark: FC<CheckmarkProps> = memo(({className}: CheckmarkProps) => (
  <svg
    className={classnames('icon', 'icon--checkmark', className)}
    width="18"
    height="18"
    viewBox="0 0 18 18"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.904 8.563a1.25 1.25 0 1 0-1.597 1.924l3.895 3.23a1.25 1.25 0 0 0 1.727-.125l6.777-7.525a1.25 1.25 0 1 0-1.858-1.673l-5.974 6.633-2.97-2.464z"
      fillRule="nonzero"
    />
  </svg>
));

Checkmark.defaultProps = {
  className: undefined,
};

export default Checkmark;
