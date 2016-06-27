import React from 'react';

class ApplicationView extends React.Component {
  render() {
    return (
      <div className="application__view">
        {this.props.children}
      </div>
    );
  }
}

ApplicationView.propTypes = {
  children: React.PropTypes.node
};

export default ApplicationView;
