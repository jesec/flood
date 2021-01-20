import classnames from 'classnames';
import {FC, memo} from 'react';

interface AddMiniProps {
  className?: string;
}

const AddMini: FC<AddMiniProps> = memo(({className}: AddMiniProps) => (
  <svg className={classnames('icon', 'icon--addmini', className)} viewBox="0 0 8 8">
    <polygon points="8,3.5 4.5,3.5 4.5,0 3.5,0 3.5,3.5 0,3.5 0,4.5 3.5,4.5 3.5,8 4.5,8 4.5,4.5 8,4.5" />
  </svg>
));

AddMini.defaultProps = {
  className: undefined,
};

export default AddMini;
