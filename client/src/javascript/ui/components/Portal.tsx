import ReactDOM from 'react-dom';
import * as React from 'react';

interface PortalProps {
  children: React.ReactNode;
}

class Portal extends React.Component<PortalProps> {
  mountPoint: HTMLDivElement | null = null;

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

    const {children} = this.props;

    return ReactDOM.createPortal(children, this.mountPoint);
  }
}

export default Portal;
