import React from 'react';

class Wrapper extends React.Component {
  render() {
    let Node = this.props.component;

    return (
      <Node className={this.props.className}>
        {this.props.children}
      </Node>
    );
  }
}

Wrapper.defaultProps = {
  className: '',
  component: 'div'
};

Wrapper.propTypes = {
  children: React.PropTypes.node,
  component: React.PropTypes.string
};

export default Wrapper;
