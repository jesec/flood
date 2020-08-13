import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

export default class PanelFooter extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    hasBorder: PropTypes.bool,
  };

  render() {
    const classes = classnames('panel__footer', {
      'panel__footer--has-border': this.props.hasBorder,
    });

    return <div className={classes}>{this.props.children}</div>;
  }
}
