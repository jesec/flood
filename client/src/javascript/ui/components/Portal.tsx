import React from 'react';
import ReactDOM from 'react-dom';

class Portal extends React.Component {
  mountPoint: HTMLDivElement | null = null;

  static defaultProps = {
    children: <div />,
  };

  componentDidMount() {
    this.mountPoint = document.createElement('div');
    this.mountPoint.classList.add('portal');
    document.body.appendChild(this.mountPoint);
  }

  componentWillUnmount() {
    if (this.mountPoint == null) {
      return;
    }
    ReactDOM.unmountComponentAtNode(this.mountPoint);
    document.body.removeChild(this.mountPoint);
  }

  render() {
    if (this.mountPoint == null) return null;
    return ReactDOM.createPortal(this.props.children, this.mountPoint);
  }
}

export default Portal;
