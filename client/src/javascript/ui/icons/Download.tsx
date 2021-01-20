import classnames from 'classnames';
import {FC, memo} from 'react';

interface DownloadProps {
  className?: string;
}

const Download: FC<DownloadProps> = memo(({className}: DownloadProps) => (
  <svg className={classnames('icon', 'icon--download', className)} viewBox="0 0 60 60">
    <rect x="28.2" width="3.7" height="55.5" />
    <polygon points="30,60 11.8,32.7 14.9,30.7 30,53.3 45.1,30.7 48.2,32.7 " />
  </svg>
));

Download.defaultProps = {
  className: undefined,
};

export default Download;
