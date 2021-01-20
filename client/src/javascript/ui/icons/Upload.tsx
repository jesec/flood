import classnames from 'classnames';
import {FC, memo} from 'react';

interface UploadProps {
  className?: string;
}

const Upload: FC<UploadProps> = memo(({className}: UploadProps) => (
  <svg className={classnames('icon', 'icon--upload', className)} viewBox="0 0 60 60">
    <rect x="28.2" y="4.5" width="3.7" height="55.5" />
    <polygon points="30,0 48.2,27.3 45.1,29.3 30,6.7 14.9,29.3 11.8,27.3 " />
  </svg>
));

Upload.defaultProps = {
  className: undefined,
};

export default Upload;
