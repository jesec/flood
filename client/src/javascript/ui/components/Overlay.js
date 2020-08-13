import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

class Overlay extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    isInteractive: PropTypes.bool,
    isTransparent: PropTypes.bool,
  };

  static defaultProps = {
    isInteractive: true,
  };

  render() {
    const classes = classnames('overlay', this.props.additionalClassNames, {
      'overlay--no-interaction': !this.props.isInteractive,
      'overlay--transparent': this.props.isTransparent,
    });

    return (
      <div className={classes} onClickCapture={this.props.onClick}>
        {this.props.children}
      </div>
    );
  }
}

export default Overlay;
