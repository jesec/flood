import classnames from 'classnames';
import * as React from 'react';

import Tooltip from '../general/Tooltip';

interface ActionProps {
  clickHandler: () => void;
  icon: React.ReactNode;
  label: React.ReactNode;
  slug: string;
  noTip?: boolean;
}

const Action: React.FC<ActionProps> = (props: ActionProps) => {
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
