import {FormattedMessage, injectIntl} from 'react-intl';
import {Form, FormRow, FormRowItem, Textbox} from 'flood-ui-kit';
import Dropzone from 'react-dropzone';
import React from 'react';

import AddTorrentsActions from './AddTorrentsActions';
import Close from '../../icons/Close';
import File from '../../icons/File';
import Files from '../../icons/Files';
import ModalFormSectionHeader from '../../modals/ModalFormSectionHeader';
import SettingsStore from '../../../stores/SettingsStore';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentDestination from '../../general/filesystem/TorrentDestination';

class AddTorrentsByFile extends React.Component {
  _formData = {};
  _formRef = null;

  state = {
    errors: {},
    isAddingTorrents: false,
    files: null,
    tags: '',
    startTorrents: SettingsStore.getFloodSettings('startTorrentsOnLoad')
  };

  getFileDropzone() {
    const dropzoneContent = (
      <Dropzone
        activeClassName="dropzone--is-dragging"
        className="form__dropzone dropzone interactive-list"
        ref="dropzone"
        onDrop={this.handleFileDrop}
        disablePreview
      >
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
      const files = this.state.files.map((file, index) => {
        return (
          <li
            className="dropzone__selected-files__file interactive-list__item"
            key={index}
            title={file.name}
          >
            <span className="interactive-list__icon">
              <File />
            </span>
            <span className="interactive-list__label">
              {file.name}
            </span>
            <span
              className="interactive-list__icon interactive-list__icon--action interactive-list__icon--action--warning"
              onClick={() => this.handleFileRemove(index)}
            >
              <Close />
            </span>
          </li>
        );
      });

      fileContent = (
        <ul
          className="dropzone__selected-files interactive-list"
          onClick={this.handleFilesClick}
        >
          {files}
        </ul>
      );
    }

    let content = (
      <FormRowItem>
        {fileContent}
        {dropzoneContent}
      </FormRowItem>
    );

    return content;
  }

  handleFileDrop = files => {
    const nextErrorsState = this.state.errors;

    if (nextErrorsState.files != null) {
      delete nextErrorsState.files;
    }

    this.setState({errors: nextErrorsState, files});
  };

  handleFileRemove = fileIndex => {
    let files = this.state.files;
    files.splice(fileIndex, 1);

    this.setState({files});
  };

  handleFilesClick(event) {
    event.stopPropagation();
  }

  handleAddTorrents = () => {
    const formData = this._formRef.getFormData();
    this.setState({isAddingTorrents: true});

    const fileData = new FormData();
    const {destination, start, tags, useBasePath} = formData;

    this.state.files.forEach(file => {
      fileData.append('torrents', file);
    });

    tags.split(',').forEach(tag => {
      fileData.append('tags', tag);
    });

    fileData.append('destination', destination);
    fileData.append('isBasePath', useBasePath);
    fileData.append('start', start);

    TorrentActions.addTorrentsByFiles(fileData, destination);
    SettingsStore.updateOptimisticallyOnly({id: 'startTorrentsOnLoad', data: start});
  };

  handleFormChange = ({event, formData}) => {
    this._formData = formData;
  };

  render() {
    return (
      <Form className="inverse" onChange={this.handleFormChange} ref={ref => this._formRef = ref}>
        <ModalFormSectionHeader>
          <FormattedMessage
            id="torrents.add.torrents.label"
            defaultMessage="Torrents"
          />
        </ModalFormSectionHeader>
        <FormRow>
          {this.getFileDropzone()}
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage
            id="torrents.add.destination.label"
            defaultMessage="Destination"
          />
        </ModalFormSectionHeader>
        <TorrentDestination
          id="destination"
          label={this.props.intl.formatMessage({
            id: 'torrents.add.destination.label',
            defaultMessage: 'Destination'
          })}
        />
        <ModalFormSectionHeader>
          <FormattedMessage
            id="torrents.add.tags"
            defaultMessage="Tags"
          />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox id="tags" defaultValue={this.state.tags} />
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

export default injectIntl(AddTorrentsByFile, {withRef: true});
