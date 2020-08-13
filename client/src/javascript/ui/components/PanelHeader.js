import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

export default class PanelHeader extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    hasBorder: PropTypes.bool,
    level: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
  };

  static defaultProps = {
    hasBorder: false,
    level: 1,
  };

  render() {
    const classes = classnames(`panel__header panel__header--level-${this.props.level}`, {
      'panel__header--has-border': this.props.hasBorder,
    });

    return <div className={classes}>{this.props.children}</div>;
  }
}
