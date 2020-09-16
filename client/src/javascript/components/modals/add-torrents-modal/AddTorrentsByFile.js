import {FormattedMessage, injectIntl} from 'react-intl';
import Dropzone from 'react-dropzone';
import React from 'react';

import {Form, FormRow, FormRowItem, Textbox} from '../../../ui';
import AddTorrentsActions from './AddTorrentsActions';
import Close from '../../icons/Close';
import File from '../../icons/File';
import Files from '../../icons/Files';
import SettingsStore from '../../../stores/SettingsStore';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentDestination from '../../general/filesystem/TorrentDestination';

class AddTorrentsByFile extends React.Component {
  formRef = null;

  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      isAddingTorrents: false,
      files: [],
      tags: '',
    };
  }

  getFileDropzone() {
    let fileContent = null;

    if (this.state.files.length > 0) {
      const files = this.state.files.map((file, index) => (
        <li className="dropzone__selected-files__file interactive-list__item" key={file.name} title={file.name}>
          <span className="interactive-list__icon">
            <File />
          </span>
          <span className="interactive-list__label">{file.name}</span>
          <span
            className="interactive-list__icon interactive-list__icon--action interactive-list__icon--action--warning"
            onClick={() => this.handleFileRemove(index)}>
            <Close />
          </span>
        </li>
      ));

      fileContent = (
        <ul className="dropzone__selected-files interactive-list" onClick={this.handleFilesClick}>
          {files}
        </ul>
      );
    }

    return (
      <FormRowItem>
        <label className="form__element__label">
          <FormattedMessage id="torrents.add.torrents.label" />
        </label>
        {fileContent}
        <Dropzone onDrop={this.handleFileDrop}>
          {({getRootProps, getInputProps, isDragActive}) => (
            <div
              {...getRootProps()}
              className={`form__dropzone dropzone interactive-list ${isDragActive ? 'dropzone--is-dragging' : ''}`}>
              <input {...getInputProps()} />
              <div className="dropzone__copy">
                <div className="dropzone__icon">
                  <Files />
                </div>
                <FormattedMessage id="torrents.add.tab.file.drop" />{' '}
                <span className="dropzone__browse-button">
                  <FormattedMessage id="torrents.add.tab.file.browse" />
                </span>
                .
              </div>
            </div>
          )}
        </Dropzone>
      </FormRowItem>
    );
  }

  handleFileDrop = (files) => {
    const nextErrorsState = this.state.errors;

    if (nextErrorsState.files != null) {
      delete nextErrorsState.files;
    }

    this.setState((state) => ({errors: nextErrorsState, files: state.files.concat(files)}));
  };

  handleFileRemove = (fileIndex) => {
    const {files} = this.state;
    files.splice(fileIndex, 1);
    this.setState({files});
  };

  handleFilesClick(event) {
    event.stopPropagation();
  }

  handleAddTorrents = () => {
    const formData = this.formRef.getFormData();
    this.setState({isAddingTorrents: true});

    const fileData = new FormData();
    const {destination, start, tags, useBasePath} = formData;

    this.state.files.forEach((file) => {
      fileData.append('torrents', file);
    });

    tags.split(',').forEach((tag) => {
      fileData.append('tags', tag);
    });

    fileData.append('destination', destination);
    fileData.append('isBasePath', useBasePath);
    fileData.append('start', start);

    TorrentActions.addTorrentsByFiles(fileData, destination);
    SettingsStore.setFloodSetting('startTorrentsOnLoad', start);
  };

  render() {
    return (
      <Form
        className="inverse"
        ref={(ref) => {
          this.formRef = ref;
        }}>
        <FormRow>{this.getFileDropzone()}</FormRow>
        <TorrentDestination
          id="destination"
          label={this.props.intl.formatMessage({
            id: 'torrents.add.destination.label',
          })}
        />
        <FormRow>
          <Textbox
            label={this.props.intl.formatMessage({
              id: 'torrents.add.tags',
            })}
            defaultValue={this.state.tags}
            id="tags"
          />
        </FormRow>
        <AddTorrentsActions
          dismiss={this.props.dismissModal}
          onAddTorrentsClick={this.handleAddTorrents}
          isAddingTorrents={this.state.isAddingTorrents}
        />
      </Form>
    );
  }
}

export default injectIntl(AddTorrentsByFile, {forwardRef: true});
