import classnames from 'classnames';
import {FC, memo} from 'react';

interface DownloadSmallProps {
  className?: string;
}

const DownloadSmall: FC<DownloadSmallProps> = memo(({className}: DownloadSmallProps) => (
  <svg className={classnames('icon', 'icon--download-small', className)} viewBox="0 0 60 60">
    <path d="M55.9,39.1l-8.8-6.4h-5.4l9.4,7.8h-9.8c-0.3,0-0.5,0.2-0.7,0.4l-2.3,6.7H21.7l-2.3-6.7 c-0.1-0.2-0.4-0.4-0.7-0.4H8.9l9.4-7.8h-5.4l-8.8,6.4C2.8,40,2,41.9,2.4,43.5l1.6,9.2c0.4,1.5,1.9,2.8,3.5,2.8h45.2 c1.6,0,3.1-1.3,3.5-2.8l1.6-9.2C58,41.9,57.2,40,55.9,39.1z M44.4,20.1h-8.9V4.5h-11v15.6h-8.9L30,34.5L44.4,20.1z" />
  </svg>
));

DownloadSmall.defaultProps = {
  className: undefined,
};

export default DownloadSmall;
