import classnames from 'classnames';
import {FC, memo} from 'react';

interface ETAProps {
  className?: string;
}

const ETA: FC<ETAProps> = memo(({className}: ETAProps) => (
  <svg className={classnames('icon', 'icon--eta', className)} viewBox="0 0 60 60">
    <path
      className="icon__ring"
      d="M44.28,54.77a28.56,28.56,0,1,1,10.45-39A28.56,28.56,0,0,1,44.28,54.77Zm6-36.41a23.36,23.36,0,1,0-8.55,31.92A23.36,23.36,0,0,0,50.23,18.36Z"
    />
    <polygon
      className="icon__hands"
      points="30 17.06 35.19 17.06 35.19 32.64 35.19 37.83 30 37.83 19.62 37.83 19.62 32.64 30 32.64 30 17.06"
    />
  </svg>
));

ETA.defaultProps = {
  className: undefined,
};

export default ETA;
