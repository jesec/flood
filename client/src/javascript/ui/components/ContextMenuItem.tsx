import classnames from 'classnames';
import React, {PureComponent} from 'react';

export default class ContextMenuItem extends PureComponent<{
  className?: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}> {
  render() {
    const classes = classnames('context-menu__item', this.props.className);

    return (
      <div className={classes} onClick={this.props.onClick}>
        {this.props.children}
      </div>
    );
  }
}
