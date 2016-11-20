import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';

class Portal extends React.Component {
  componentDidMount() {
    this.nodeEl = document.createElement('div');
    document.body.appendChild(this.nodeEl);
    this.renderChildren(this.props);
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.nodeEl);
    document.body.removeChild(this.nodeEl);
  }

  componentWillReceiveProps(nextProps) {
    this.renderChildren(nextProps);
  }

  renderChildren(props) {
    if (props.children) {
      ReactDOM.render(props.children, this.nodeEl);
    }
  }

  render() {
    return null;
  }
}

Portal.defaultProps = {
  children: <div />
};

Portal.propTypes = {
  children: PropTypes.node
};

export default Portal;
