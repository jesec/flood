import {FormattedMessage} from 'react-intl';
import classnames from 'classnames';
import Dropzone from 'react-dropzone';
import React from 'react';

import AddTorrentsActions from './AddTorrentsActions';
import Close from '../../Icons/Close';
import File from '../../Icons/File';
import Files from '../../Icons/Files';
import ModalActions from '../ModalActions';
import SettingsStore from '../../../stores/SettingsStore';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentDestination from '../../General/Filesystem/TorrentDestination';

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
      destination: SettingsStore.getFloodSettings('torrentDestination'),
      isAddingTorrents: false,
      files: null,
      startTorrents: SettingsStore.getFloodSettings('startTorrentsOnLoad')
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
          <FormattedMessage
            id="torrents.add.tab.file.drop"
            defaultMessage="Drop some files here,"
          /> <span className="dropzone__browse-button">
          <FormattedMessage
            id="torrents.add.tab.file.browse"
            defaultMessage="or click to browse"
          /></span>.
        </div>
      </Dropzone>
    );
    let fileContent = null;

    if (this.state.files && this.state.files.length > 0) {
      let files = this.state.files.map((file, index) => {
        return (
          <li className="dropzone__selected-files__file interactive-list__item"
            key={index} title={file.name}>
            <span className="interactive-list__icon">
              <File />
            </span>
            <span className="interactive-list__label">
              {file.name}
            </span>
            <span className="interactive-list__icon interactive-list__icon--action"
              onClick={this.handleFileRemove.bind(this, index)}>
              <Close />
            </span>
          </li>
        );
      });

      fileContent = (
        <ul className="dropzone__selected-files interactive-list"
          onClick={this.handleFilesClick}>
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
    fileData.append('start', this.state.startTorrents);

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
              <FormattedMessage
                id="torrents.add.torrents.label"
                defaultMessage="Torrents"
              />
            </label>
            {this.getModalContent()}
          </div>
        </div>
        <div className="form__row">
          <div className="form__column">
            <label className="form__label">
              <FormattedMessage
                id="torrents.add.destination.label"
                defaultMessage="Destination"
              />
            </label>
            <TorrentDestination onChange={this.handleDestinationChange} />
          </div>
        </div>
        <AddTorrentsActions dismiss={this.props.dismissModal}
          onAddTorrentsClick={this.handleAddTorrents}
          onStartTorrentsToggle={this.handleStartTorrentsToggle}
          isAddingTorrents={this.state.isAddingTorrents} />
      </div>
    );
  }
}
