import React from 'react';

class ModalFormSectionHeader extends React.PureComponent {
  render() {
    return <h2 className="h4">{this.props.children}</h2>;
  }
}

export default ModalFormSectionHeader;
