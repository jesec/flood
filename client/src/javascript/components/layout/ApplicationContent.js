import PropTypes from 'prop-types';
import React from 'react';

class ApplicationContent extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    return <div className="application__content">{this.props.children}</div>;
  }
}

export default ApplicationContent;
