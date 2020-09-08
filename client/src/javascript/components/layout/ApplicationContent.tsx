import React from 'react';

class ApplicationContent extends React.Component {
  render() {
    return <div className="application__content">{this.props.children}</div>;
  }
}

export default ApplicationContent;
