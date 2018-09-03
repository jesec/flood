import classnames from 'classnames';
import React from 'react';

import Tooltip from '../general/Tooltip';

export default class Action extends React.Component {
  render() {
    const {clickHandler, icon, label, slug} = this.props;
    const classes = classnames('action tooltip__wrapper', {
      [`action--${slug}`]: slug != null,
    });

    return (
      <Tooltip content={label} onClick={clickHandler} position="bottom" wrapperClassName={classes}>
        {icon}
        <span className="action__label">{label}</span>
      </Tooltip>
    );
  }
}
