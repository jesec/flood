import classnames from 'classnames';
import React from 'react';

interface ApplicationContentProps {
  baseClassName: string;
  className: string;
  modifier: string;
}

class ApplicationContent extends React.Component<ApplicationContentProps> {
  static defaultProps = {
    baseClassName: 'application__panel',
  };

  render() {
    const classes = classnames(this.props.baseClassName, {
      [`${this.props.baseClassName}--${this.props.modifier}`]: this.props.baseClassName,
      [this.props.className]: this.props.className,
    });

    return <div className={classes}>{this.props.children}</div>;
  }
}

export default ApplicationContent;
