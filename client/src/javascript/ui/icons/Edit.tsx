import classnames from 'classnames';
import {FC, memo} from 'react';

interface EditProps {
  className?: string;
}

const Edit: FC<EditProps> = memo(({className}: EditProps) => (
  <svg className={classnames('icon', 'icon--edit', className)} viewBox="0 0 60 60">
    <path d="M12,38.79l10.84,11H12Zm19-21.54L41.75,28.09,25.44,47.17l-10.78-11Zm5.65-6c1.69-1.69,4.94-1.19,7.26,1.13l2.1,2.1c2.32,2.32,2.82,5.57,1.13,7.26L43.7,25.08,33.21,14.59Z" />
  </svg>
));

Edit.defaultProps = {
  className: undefined,
};

export default Edit;
