import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

export default class Container extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    const classes = classnames('container');

    return <div className={classes}>{this.props.children}</div>;
  }
}
