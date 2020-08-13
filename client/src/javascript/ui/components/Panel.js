import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

class Panel extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    theme: PropTypes.oneOf(['light', 'dark']),
    spacing: PropTypes.oneOf(['small', 'medium', 'large']),
    transparent: PropTypes.bool,
  };

  static defaultProps = {
    spacing: 'medium',
    theme: 'light',
  };

  render() {
    const classes = classnames(`panel panel--${this.props.theme}`, `panel--${this.props.spacing}`, {
      'panel--transparent': this.props.transparent,
    });

    return <div className={classes}>{this.props.children}</div>;
  }
}

export default Panel;
