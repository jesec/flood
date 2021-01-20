import classnames from 'classnames';
import {FC, memo} from 'react';

interface UploadSmallProps {
  className?: string;
}

const UploadSmall: FC<UploadSmallProps> = memo(({className}: UploadSmallProps) => (
  <svg className={classnames('icon', 'icon--upload-small', className)} viewBox="0 0 60 60">
    <path d="m15.6 18.9h8.9v15.6h11v-15.6h8.9l-14.4-14.4z" />
    <path d="m55.9 39.1-8.8-6.4h-5.4l9.4 7.8h-9.8c-0.3 0-0.5 0.2-0.7 0.4l-2.3 6.7h-16.6l-2.3-6.7c-0.1-0.2-0.4-0.4-0.7-0.4h-9.8l9.4-7.8h-5.4l-8.8 6.4c-1.3 0.9-2.1 2.8-1.7 4.4l1.6 9.2c0.4 1.5 1.9 2.8 3.5 2.8h45.2c1.6 0 3.1-1.3 3.5-2.8l1.6-9.2c0.2-1.6-0.6-3.5-1.9-4.4z" />
  </svg>
));

UploadSmall.defaultProps = {
  className: undefined,
};

export default UploadSmall;
