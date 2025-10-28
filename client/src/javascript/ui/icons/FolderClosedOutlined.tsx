import classnames from 'classnames';
import {FC, memo} from 'react';

interface FolderClosedOutlineProps {
  className?: string;
}

const FolderClosedOutline: FC<FolderClosedOutlineProps> = memo(({className}: FolderClosedOutlineProps = {}) => (
  <svg className={classnames('icon', 'icon--directory-outlined', className)} viewBox="0 0 60 60">
    <path d="M52.3,47.47a7.07,7.07,0,0,1-7,7H7a7.07,7.07,0,0,1-7-7V17.29a7.07,7.07,0,0,1,7-7H17.1a7.07,7.07,0,0,1,7,7v1H45.26a7.07,7.07,0,0,1,7,7V47.47Zm-4-22.13a3,3,0,0,0-3-3H23.13a3,3,0,0,1-3-3v-2a3,3,0,0,0-3-3H7a3,3,0,0,0-3,3V47.47a3,3,0,0,0,3,3H45.26a3,3,0,0,0,3-3V25.34Z" />
  </svg>
));

export default FolderClosedOutline;
