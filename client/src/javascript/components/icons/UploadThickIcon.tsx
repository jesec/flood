import classnames from 'classnames';
import {FC, memo} from 'react';

interface UploadThickIconProps {
  className?: string;
}

const UploadThickIcon: FC<UploadThickIconProps> = memo(({className}: UploadThickIconProps) => (
  <svg className={classnames('icon', 'icon--upload', className)} viewBox="0 0 60 60">
    <polygon points="15.9,36.6 27,19.9 27,55 33,55 33,19.9 44.1,36.6 49.1,33.3 30,4.6 10.9,33.3 " />
  </svg>
));

UploadThickIcon.defaultProps = {
  className: undefined,
};

export default UploadThickIcon;
