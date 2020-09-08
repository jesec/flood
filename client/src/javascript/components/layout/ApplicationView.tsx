import classnames from 'classnames';
import React from 'react';

interface ApplicationViewProps {
  modifier?: string;
}

class ApplicationView extends React.Component<ApplicationViewProps> {
  render() {
    const classes = classnames('application__view', {
      [`application__view--${this.props.modifier}`]: this.props.modifier != null,
    });

    return <div className={classes}>{this.props.children}</div>;
  }
}

export default ApplicationView;
