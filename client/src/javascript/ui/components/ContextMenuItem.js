import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

export default class ContextMenuItem extends PureComponent {
  static propTypes = {
    onClick: PropTypes.func,
  };

  render() {
    const classes = classnames('context-menu__item', this.props.className);

    return (
      <div className={classes} onClick={this.props.onClick}>
        {this.props.children}
      </div>
    );
  }
}
