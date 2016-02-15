import Dropzone from 'react-dropzone';
import React from 'react';

const METHODS_TO_BIND = ['handleOpenClick'];

export default class AddTorrents extends React.Component {
  constructor() {
    super();

    this.state = {
      files: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleFileDrop(files) {
    this.setState({files});
  }

  render() {
    return (
      <div className="form">
        <Dropzone className="form__dropzone dropzone" ref="dropzone" onDrop={this.handleFileDrop}>
          Drop some files here,
          <span className="dropzone__browse-button">
            or click to browse.
          </span>
        </Dropzone>
      </div>
    );
  }
}
