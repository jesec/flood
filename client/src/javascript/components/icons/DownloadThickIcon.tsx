import classnames from 'classnames';
import {FC, memo} from 'react';

interface DownloadThickIconProps {
  className?: string;
}

const DownloadThickIcon: FC<DownloadThickIconProps> = memo(({className}: DownloadThickIconProps) => (
  <svg className={classnames('icon', 'icon--download', className)} viewBox="0 0 60 60">
    <polygon points="44.1,23 33,39.7 33,4.6 27,4.6 27,39.7 15.9,23 10.9,26.4 30,55 49.1,26.4 " />
  </svg>
));

DownloadThickIcon.defaultProps = {
  className: undefined,
};

export default DownloadThickIcon;
