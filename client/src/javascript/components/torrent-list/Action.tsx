import classnames from 'classnames';
import {FC, ReactNode} from 'react';

import Tooltip from '../general/Tooltip';

interface ActionProps {
  clickHandler: () => void;
  icon: ReactNode;
  label: ReactNode;
  slug: string;
  noTip?: boolean;
}

const Action: FC<ActionProps> = (props: ActionProps) => {
  const {clickHandler, icon, label, slug, noTip} = props;
  const classes = classnames('action tooltip__wrapper', {
    [`action--${slug}`]: slug != null,
  });

  return (
    <Tooltip content={label} onClick={clickHandler} position="bottom" wrapperClassName={classes} suppress={noTip}>
      {icon}
      <span className="action__label">{label}</span>
    </Tooltip>
  );
};

Action.defaultProps = {
  noTip: false,
};

export default Action;
