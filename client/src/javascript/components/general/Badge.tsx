import React from 'react';

export default class Badge extends React.Component {
  render() {
    return <div className="badge">{this.props.children}</div>;
  }
}
