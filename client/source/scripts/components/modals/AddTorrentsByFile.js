import classnames from 'classnames';
import Dropzone from 'react-dropzone';
import React from 'react';

import AddTorrentsActions from './AddTorrentsActions';
import AddTorrentsDestination from './AddTorrentsDestination';
import Close from '../icons/Close';
import File from '../icons/File';
import Files from '../icons/Files';
import ModalActions from './ModalActions';
import TorrentActions from '../../actions/TorrentActions';

const METHODS_TO_BIND = [
  'handleAddTorrents',
  'handleDestinationChange',
  'handleFileDrop',
  'handleFileRemove',
  'handleStartTorrentsToggle'
];

export default class AddTorrentsByFile extends React.Component {
  constructor() {
    super();

    this.state = {
      isAddingTorrents: false,
      files: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleFileDrop(files) {
    this.setState({files});
  }

  handleFileRemove(fileIndex) {
    let files = this.state.files;
    files.splice(fileIndex, 1);

    this.setState({files});
  }

  handleFilesClick(event) {
    event.stopPropagation();
  }

  getModalContent() {
    let dropzoneClasses = classnames('form__dropzone dropzone', {
      'is-fulfilled': this.state.files && this.state.files.length > 0
    });
    let dropzoneContent = (
      <Dropzone activeClassName="dropzone--is-dragging"
        className={dropzoneClasses} ref="dropzone"
        onDrop={this.handleFileDrop} disablePreview={true}>
        <div className="dropzone__copy">
          <div className="dropzone__icon">
            <Files />
          </div>
          Drop some files here, <span className="dropzone__browse-button">
          or click to browse</span>.
        </div>
      </Dropzone>
    );
    let fileContent = null;

    if (this.state.files && this.state.files.length > 0) {
      let files = this.state.files.map((file, index) => {
        return (
          <li className="dropzone__selected-files__file dropzone__file" key={index}>
            <span className="dropzone__file__item dropzone__file__item--icon">
              <File />
            </span>
            <span className="dropzone__file__item dropzone__file__item--file-name">
              {file.name}
            </span>
            <span className="dropzone__file__item dropzone__file__item--icon dropzone__file__item--remove-icon" onClick={this.handleFileRemove.bind(this, index)}>
              <Close />
            </span>
          </li>
        );
      });

      fileContent = (
        <ul className="dropzone__selected-files" onClick={this.handleFilesClick}>
          {files}
        </ul>
      );
    }

    let content = (
      <div>
        {fileContent}
        {dropzoneContent}
      </div>
    );

    return content;
  }

  handleAddTorrents() {
    if (!this.state.files || this.state.files.length === 0) {
      return;
    }

    this.setState({isAddingTorrents: true});

    let fileData = new FormData();

    this.state.files.forEach((file) => {
      fileData.append('torrents', file);
    });

    fileData.append('destination', this.state.destination);

    TorrentActions.addTorrentsByFiles(fileData, this.state.destination);
  }

  handleStartTorrentsToggle(value) {
    this.setState({startTorrents: value});
  }

  handleDestinationChange(destination) {
    this.setState({destination});
  }

  render() {
    return (
      <div className="form">
        <div className="form__row">
          <div className="form__column">
            <label className="form__label">
              Torrents
            </label>
            {this.getModalContent()}
          </div>
        </div>
        <AddTorrentsDestination onChange={this.handleDestinationChange} />
        <AddTorrentsActions dismiss={this.props.dismissModal}
          onAddTorrentsClick={this.handleAddTorrents}
          onStartTorrentsToggle={this.handleStartTorrentsToggle}
          isAddingTorrents={this.state.isAddingTorrents} />
      </div>
    );
  }
}
