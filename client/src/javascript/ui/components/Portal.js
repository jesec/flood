import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

class Portal extends React.Component {
  mountPoint = null;

  static propTypes = {
    children: PropTypes.node,
  };

  static defaultProps = {
    children: <div />,
  };

  componentDidMount() {
    this.mountPoint = global.document.createElement('div');
    this.mountPoint.classList.add('portal');
    global.document.body.appendChild(this.mountPoint);
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.mountPoint);
    global.document.body.removeChild(this.mountPoint);
  }

  render() {
    if (this.mountPoint == null) return null;
    return ReactDOM.createPortal(this.props.children, this.mountPoint);
  }
}

export default Portal;
