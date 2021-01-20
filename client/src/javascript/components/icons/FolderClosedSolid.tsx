import classnames from 'classnames';
import {FC, memo} from 'react';

interface FolderClosedOutlineProps {
  className?: string;
}

const FolderClosedOutline: FC<FolderClosedOutlineProps> = memo(({className}: FolderClosedOutlineProps) => (
  <svg className={classnames('icon', 'icon--folder', className)} viewBox="0 0 60 60">
    <path d="M48.71,23.45a6.49,6.49,0,0,0-6.37-6.55H23.23V16a6.49,6.49,0,0,0-6.37-6.55H7.76A6.49,6.49,0,0,0,1.39,16V44a6.49,6.49,0,0,0,6.37,6.55H42.34A6.49,6.49,0,0,0,48.71,44V23.45Z" />
  </svg>
));

FolderClosedOutline.defaultProps = {
  className: undefined,
};

export default FolderClosedOutline;
