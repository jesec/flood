import React from 'react';

import Modal from '../Modal';

interface ConfirmModalProps {
  options: {
    content: React.ReactNode;
    heading: React.ReactNode;
    actions: Modal['props']['actions'];
  };
}

export default class ConfirmModal extends React.Component<ConfirmModalProps> {
  getContent() {
    return <div className="modal__content">{this.props.options.content}</div>;
  }

  render() {
    return (
      <Modal
        actions={this.props.options.actions}
        alignment="center"
        content={this.getContent()}
        heading={this.props.options.heading}
      />
    );
  }
}
