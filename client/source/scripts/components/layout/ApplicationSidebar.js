import React from 'react';

class ApplicationSidebar extends React.Component {
  render() {
    return (
      <div className="sidebar">
        {this.props.children}
      </div>
    );
  }
}

ApplicationSidebar.propTypes = {
  children: React.PropTypes.node
};

export default ApplicationSidebar;
