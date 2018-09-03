import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

class ApplicationContent extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    modifier: PropTypes.string,
  };

  static defaultProps = {
    baseClassName: 'application__panel',
  };

  render() {
    let classes = classnames(this.props.baseClassName, {
      [`${this.props.baseClassName}--${this.props.modifier}`]: this.props.baseClassName,
      [this.props.className]: this.props.className,
    });

    return <div className={classes}>{this.props.children}</div>;
  }
}

export default ApplicationContent;
