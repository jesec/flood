import classnames from 'classnames';
import {FC, memo} from 'react';

interface DetailNotAvailableProps {
  className?: string;
}

const DetailNotAvailable: FC<DetailNotAvailableProps> = memo(({className}: DetailNotAvailableProps) => (
  <svg className={classnames('icon', 'icon--clock', className)} viewBox="0 0 60 60">
    <rect y="26.63" width="60" height="6.75" />
  </svg>
));

DetailNotAvailable.defaultProps = {
  className: undefined,
};

export default DetailNotAvailable;
