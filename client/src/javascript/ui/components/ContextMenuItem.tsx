import classnames from 'classnames';
import * as React from 'react';

export default class ContextMenuItem extends React.PureComponent<{
  className?: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}> {
  render() {
    const {onClick, children, className} = this.props;
    const classes = classnames('context-menu__item', className);

    return (
      <div className={classes} onClick={onClick}>
        {children}
      </div>
    );
  }
}
