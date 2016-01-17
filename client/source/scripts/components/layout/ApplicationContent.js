import React from 'react';

class ApplicationContent extends React.Component {
  render() {
    return (
      <div className="application__content">
        {this.props.children}
      </div>
    );
  }
}

ApplicationContent.propTypes = {
  children: React.PropTypes.node
};

export default ApplicationContent;
