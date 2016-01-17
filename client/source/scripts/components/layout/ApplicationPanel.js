import classnames from 'classnames';
import React from 'react';

class ApplicationContent extends React.Component {
  render() {
    let classes = classnames(this.props.baseClassName, {
      [`${this.props.baseClassName}--${this.props.modifier}`]: this.props.baseClassName,
      [this.props.extension]: this.props.extension
    });

    return (
      <div className={classes}>
        {this.props.children}
      </div>
    );
  }
}

ApplicationContent.defaultProps = {
  baseClassName: 'application__panel'
};

ApplicationContent.propTypes = {
  children: React.PropTypes.node,
  extension: React.PropTypes.string,
  modifier: React.PropTypes.string
};

export default ApplicationContent;
