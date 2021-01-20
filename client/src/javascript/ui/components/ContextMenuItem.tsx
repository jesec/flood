import classnames from 'classnames';
import {MouseEventHandler, PureComponent} from 'react';

export default class ContextMenuItem extends PureComponent<{
  className?: string;
  onClick: MouseEventHandler<HTMLDivElement>;
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
