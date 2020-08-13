import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

export default class PanelContent extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    hasBorder: PropTypes.bool,
    borderPosition: PropTypes.string,
  };

  static defaultProps = {
    hasBorder: false,
    borderPosition: 'top',
  };

  render() {
    const classes = classnames(`panel__content`, {
      [`panel__content--has-border--${this.props.borderPosition}`]: this.props.hasBorder,
    });

    return <div className={classes}>{this.props.children}</div>;
  }
}
