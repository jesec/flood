import classnames from 'classnames';
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl';
import Dropzone from 'react-dropzone';
import React from 'react';

import AddTorrentsActions from './AddTorrentsActions';
import Close from '../../icons/Close';
import File from '../../icons/File';
import Files from '../../icons/Files';
import FormColumn from '../../general/form-elements/FormColumn';
import FormLabel from '../../general/form-elements/FormLabel';
import ModalActions from '../ModalActions';
import SettingsStore from '../../../stores/SettingsStore';
import TorrentActions from '../../../actions/TorrentActions';
import TorrentDestination from '../../general/filesystem/TorrentDestination';
import Validator from '../../../util/Validator';

const messages = defineMessages({
  mustSpecifyDestination: {
    id: 'torrents.add.tab.destination.empty',
    defaultMessage: 'You must specify a destination.'
  },
  mustSpecifyFiles: {
    id: 'torrents.add.tab.files.empty',
    defaultMessage: 'You must select at least one file.'
  }
});

const METHODS_TO_BIND = [
  'handleAddTorrents',
  'handleFileDrop',
  'handleFileRemove',
  'handleStartTorrentsToggle',
  'handleTagsChange'
];

class AddTorrentsByFile extends React.Component {
  constructor(props) {
    super();

    this.state = {
      errors: {},
      isAddingTorrents: false,
      files: null,
      tags: '',
      startTorrents: SettingsStore.getFloodSettings('startTorrentsOnLoad')
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.validatedFields = {
      destination: {
        isValid: Validator.isNotEmpty,
        error: props.intl.formatMessage(messages.mustSpecifyDestination)
      },
      files: {
        isValid: file => {
          return file != null;
        },
        error: props.intl.formatMessage(messages.mustSpecifyFiles)
      }
    };
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

  handleFileDrop(files) {
    const nextErrorsState = this.state.errors;

    if (nextErrorsState.files != null) {
      delete nextErrorsState.files;
    }

    this.setState({errors: nextErrorsState, files});
  }

  handleFileRemove(fileIndex) {
    let files = this.state.files;
    files.splice(fileIndex, 1);

    this.setState({files});
  }

  handleFilesClick(event) {
    event.stopPropagation();
  }

  handleAddTorrents() {
    if (this.isFormValid()) {
      this.setState({isAddingTorrents: true});

      const destination = this.torrentDestinationRef.getWrappedInstance()
        .getValue();

      const isBasePath = this.torrentDestinationRef.getWrappedInstance()
        .isBasePath();

      const fileData = new FormData();

      this.state.files.forEach(file => {
        fileData.append('torrents', file);
      });

      this.state.tags.split(',').forEach(tag => {
        fileData.append('tags', tag);
      });

      fileData.append('destination', destination);
      fileData.append('isBasePath', isBasePath);
      fileData.append('start', this.state.startTorrents);

      TorrentActions.addTorrentsByFiles(fileData, destination);
    }
  }

  handleStartTorrentsToggle(value) {
    this.setState({startTorrents: value});
  }

  handleTagsChange(event) {
    this.setState({tags: event.target.value});
  }

  isFormValid() {
    const {files} = this.state;
    const nextErrorsState = {};

    const areFilesSelected = files != null
      && files.length !== 0
      && files.some((file) => {
        return this.validatedFields.files.isValid(file);
      });
    const isDestinationValid = this.validatedFields.destination
      .isValid(this.torrentDestinationRef.getWrappedInstance().getValue());

    if (!areFilesSelected) {
      nextErrorsState.files = this.validatedFields.files.error;
    }

    if (!isDestinationValid) {
      nextErrorsState.destination = this.validatedFields.destination.error;
    }

    if (!areFilesSelected || !isDestinationValid) {
      this.setState({errors: nextErrorsState});
    }

    return isDestinationValid && areFilesSelected;
  }

  render() {
    return (
      <div className="form">
        <div className="form__row">
          <FormColumn error={this.state.errors.files}>
            <FormLabel error={this.state.errors.files}>
              <FormattedMessage
                id="torrents.add.torrents.label"
                defaultMessage="Torrents"
              />
            </FormLabel>
            {this.getModalContent()}
          </FormColumn>
        </div>
        <div className="form__row">
          <FormColumn error={this.state.errors.destination}>
            <FormLabel error={this.state.errors.destination}>
              <FormattedMessage
                id="torrents.add.destination.label"
                defaultMessage="Destination"
              />
            </FormLabel>
            <TorrentDestination ref={ref => this.torrentDestinationRef = ref} />
          </FormColumn>
        </div>
        <div className="form__row">
          <FormColumn>
            <FormLabel>
              <FormattedMessage
                id="torrents.add.tags"
                defaultMessage="Tags"
              />
            </FormLabel>
            <input className="textbox"
              onChange={this.handleTagsChange}
              value={this.state.tags} />
          </FormColumn>
        </div>
        <AddTorrentsActions dismiss={this.props.dismissModal}
          onAddTorrentsClick={this.handleAddTorrents}
          onStartTorrentsToggle={this.handleStartTorrentsToggle}
          isAddingTorrents={this.state.isAddingTorrents} />
      </div>
    );
  }
}

export default injectIntl(AddTorrentsByFile, {withRef: true});
