import React from 'react';

class Application extends React.Component {
  render() {
    return (
      <div className="flood">
        {this.props.children}
      </div>
    );
  }
}

Application.propTypes = {
  children: React.PropTypes.node
};

export default Application;
