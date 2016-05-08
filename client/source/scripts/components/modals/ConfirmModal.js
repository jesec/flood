import React from 'react';

import Modal from './Modal';

export default class AddTorrents extends React.Component {
  constructor() {
    super();
  }

  getContent() {
    return (
      <div className="modal__content">
        {this.props.options.content}
      </div>
    );
  }

  render() {
    return (
      <Modal actions={this.props.options.actions}
        alignment="center"
        content={this.getContent()}
        dismiss={this.props.dismiss}
        heading={this.props.options.heading} />
    );
  }
}
