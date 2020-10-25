import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import Dropzone from 'react-dropzone';
import React from 'react';

import AddTorrentsActions from './AddTorrentsActions';
import CloseIcon from '../../icons/Close';
import FileIcon from '../../icons/File';
import FilesIcon from '../../icons/Files';
import FilesystemBrowserTextbox from '../../general/filesystem/FilesystemBrowserTextbox';
import {Form, FormRow, FormRowItem} from '../../../ui';
import {saveAddTorrentsUserPreferences} from '../../../util/userPreferences';
import TagSelect from '../../general/form-elements/TagSelect';
import TorrentActions from '../../../actions/TorrentActions';
import UIStore from '../../../stores/UIStore';

interface AddTorrentsByFileFormData {
  destination: string;
  start: boolean;
  tags: string;
  isBasePath: boolean;
  isCompleted: boolean;
}

interface AddTorrentsByFileStates {
  errors: Record<string, unknown>;
  files: Array<{
    name: string;
    data: string;
  }>;
  isAddingTorrents: boolean;
}

class AddTorrentsByFile extends React.Component<WrappedComponentProps, AddTorrentsByFileStates> {
  formRef: Form | null = null;

  constructor(props: WrappedComponentProps) {
    super(props);
    this.state = {
      errors: {},
      files: [],
      isAddingTorrents: false,
    };
  }

  getFileDropzone() {
    const {files} = this.state;

    const fileContent =
      files.length > 0 ? (
        <ul
          className="dropzone__selected-files interactive-list"
          onClick={(event) => {
            event.stopPropagation();
          }}>
          {files.map((file, index) => (
            <li className="dropzone__selected-files__file interactive-list__item" key={file.name} title={file.name}>
              <span className="interactive-list__icon">
                <FileIcon />
              </span>
              <span className="interactive-list__label">{file.name}</span>
              <span
                className="interactive-list__icon interactive-list__icon--action interactive-list__icon--action--warning"
                onClick={() => this.handleFileRemove(index)}>
                <CloseIcon />
              </span>
            </li>
          ))}
        </ul>
      ) : null;

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
                  <FilesIcon />
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

  handleFileDrop = (files: Array<File>) => {
    const nextErrorsState = this.state.errors;

    if (nextErrorsState.files != null) {
      delete nextErrorsState.files;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.setState((state) => {
          if (e.target?.result != null && typeof e.target.result === 'string') {
            return {
              errors: nextErrorsState,
              files: state.files.concat({
                name: file.name,
                data: e.target.result.split('base64,')[1],
              }),
            };
          }
          return {errors: nextErrorsState, files: state.files};
        });
      };
      reader.readAsDataURL(file);
    });
  };

  handleFileRemove = (fileIndex: number) => {
    const {files} = this.state;
    files.splice(fileIndex, 1);
    this.setState({files});
  };

  handleAddTorrents = () => {
    if (this.formRef == null) {
      return;
    }

    const formData = this.formRef.getFormData();
    this.setState({isAddingTorrents: true});

    const {destination, start, tags, isBasePath, isCompleted} = formData as Partial<AddTorrentsByFileFormData>;

    const filesData: Array<string> = [];
    this.state.files.forEach((file) => {
      filesData.push(file.data);
    });

    if (filesData.length === 0 || destination == null) {
      this.setState({isAddingTorrents: false});
      return;
    }

    TorrentActions.addTorrentsByFiles({
      files: filesData,
      destination,
      tags: tags != null ? tags.split(',') : undefined,
      isBasePath,
      isCompleted,
      start,
    }).then(() => {
      UIStore.dismissModal();
    });

    saveAddTorrentsUserPreferences({start, destination});
  };

  render() {
    const {intl} = this.props;
    const {isAddingTorrents} = this.state;

    return (
      <Form
        className="inverse"
        ref={(ref) => {
          this.formRef = ref;
        }}>
        <FormRow>{this.getFileDropzone()}</FormRow>
        <FilesystemBrowserTextbox
          id="destination"
          label={intl.formatMessage({
            id: 'torrents.add.destination.label',
          })}
          selectable="directories"
          showBasePathToggle
          showCompletedToggle
        />
        <FormRow>
          <TagSelect
            label={intl.formatMessage({
              id: 'torrents.add.tags',
            })}
            id="tags"
          />
        </FormRow>
        <AddTorrentsActions onAddTorrentsClick={this.handleAddTorrents} isAddingTorrents={isAddingTorrents} />
      </Form>
    );
  }
}

export default injectIntl(AddTorrentsByFile, {forwardRef: true});
