import React from 'react';

import Modal from './Modal';

export default class AddTorrents extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Modal actions={this.props.options.actions}
        alignment="center"
        content={this.props.options.content}
        dismiss={this.props.dismiss}
        heading={this.props.options.heading} />
    );
  }
}
