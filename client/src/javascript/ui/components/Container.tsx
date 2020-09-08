import classnames from 'classnames';
import React, {PureComponent} from 'react';

export default class Container extends PureComponent {
  render() {
    const classes = classnames('container');

    return <div className={classes}>{this.props.children}</div>;
  }
}
