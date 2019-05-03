import React from 'react';
import {defineMessages} from 'react-intl';

import ArrowIcon from '../../icons/ArrowIcon';
import CustomScrollbars from '../CustomScrollbars';
import EventTypes from '../../../constants/EventTypes';
import File from '../../icons/File';
import FolderClosedSolid from '../../icons/FolderClosedSolid';
import UIStore from '../../../stores/UIStore';

const MESSAGES = defineMessages({
  EACCES: {
    id: 'filesystem.error.eacces',
    defaultMessage: 'Flood does not have permission to read this directory.',
  },
  ENOENT: {
    id: 'filesystem.error.enoent',
    defaultMessage: 'This path does not exist. It will be created.',
  },
  emptyDirectory: {
    id: 'filesystem.empty.directory',
    defaultMessage: 'Empty directory.',
  },
  fetching: {
    id: 'filesystem.fetching',
    defaultMessage: 'Fetching directory structure...',
  },
});

class FilesystemBrowser extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      directory: props.directory,
      separator: '/',
    };
  }

  componentDidMount() {
    UIStore.listen(EventTypes.FLOOD_FETCH_DIRECTORY_LIST_ERROR, this.handleDirectoryListFetchError);
    UIStore.listen(EventTypes.FLOOD_FETCH_DIRECTORY_LIST_SUCCESS, this.handleDirectoryListFetchSuccess);
    UIStore.fetchDirectoryList({path: this.state.directory});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.directory !== this.props.directory) {
      this.setState({directory: nextProps.directory});
      UIStore.fetchDirectoryList({path: nextProps.directory});
    }
  }

  componentWillUnmount() {
    UIStore.unlisten(EventTypes.FLOOD_FETCH_DIRECTORY_LIST_ERROR, this.handleDirectoryListFetchError);
    UIStore.unlisten(EventTypes.FLOOD_FETCH_DIRECTORY_LIST_SUCCESS, this.handleDirectoryListFetchSuccess);
  }

  getNewDestination(nextDirectorySegment) {
    const {directory, separator} = this.state;

    if (directory.endsWith(separator)) {
      return `${directory}${nextDirectorySegment}`;
    }

    return `${directory}${separator}${nextDirectorySegment}`;
  }

  handleDirectoryClick = directory => {
    const nextDirectory = this.getNewDestination(directory);

    this.setState({
      directory: nextDirectory,
    });

    if (this.props.onDirectorySelection) {
      this.props.onDirectorySelection(nextDirectory);
    }
  };

  handleDirectoryListFetchError = error => {
    this.setState({
      error,
    });
  };

  handleDirectoryListFetchSuccess = response => {
    // response includes hasParent, separator, and an array of directories.
    this.setState({
      ...response,
      directory: response.path,
      error: null,
    });
  };

  handleParentDirectoryClick = () => {
    const {separator} = this.state;
    let {directory} = this.state;

    if (directory.endsWith(separator)) {
      directory = directory.substring(0, directory.length - 1);
    }

    const directoryArr = directory.split(separator);
    directoryArr.pop();

    directory = directoryArr.join(separator);

    this.setState({
      directory,
    });

    if (this.props.onDirectorySelection) {
      this.props.onDirectorySelection(directory);
    }
  };

  render() {
    const {directories, error, files = [], hasParent} = this.state;
    let errorMessage = null;
    let listItems = null;
    let parentDirectory = null;
    let shouldShowDirectoryList = true;
    let shouldForceShowParentDirectory = false;

    if (directories == null) {
      shouldShowDirectoryList = false;
      errorMessage = (
        <div className="filesystem__directory-list__item filesystem__directory-list__item--message">
          <em>{this.props.intl.formatMessage(MESSAGES.fetching)}</em>
        </div>
      );
    }

    if (error && error.data && error.data.code && MESSAGES[error.data.code]) {
      shouldShowDirectoryList = false;

      if (error.data.code === 'EACCES') {
        shouldForceShowParentDirectory = true;
      }

      errorMessage = (
        <div className="filesystem__directory-list__item filesystem__directory-list__item--message">
          <em>{this.props.intl.formatMessage(MESSAGES[error.data.code])}</em>
        </div>
      );
    }

    if (hasParent || shouldForceShowParentDirectory) {
      parentDirectory = (
        <li
          className="filesystem__directory-list__item filesystem__directory-list__item--parent"
          onClick={this.handleParentDirectoryClick}>
          <ArrowIcon />
          {this.props.intl.formatMessage({
            id: 'filesystem.parent.directory',
            defaultMessage: 'Parent Directory',
          })}
        </li>
      );
    }

    if (shouldShowDirectoryList) {
      const directoryList = directories.map((directory, index) => (
        <li
          className="filesystem__directory-list__item
            filesystem__directory-list__item--directory"
          // TODO: Find a better key
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          onClick={() => this.handleDirectoryClick(directory)}>
          <FolderClosedSolid />
          {directory}
        </li>
      ));

      const filesList = files.map((file, index) => (
        // TODO: Find a better key
        // eslint-disable-next-line react/no-array-index-key
        <li className="filesystem__directory-list__item filesystem__directory-list__item--file" key={`file.${index}`}>
          <File />
          {file}
        </li>
      ));

      listItems = directoryList.concat(filesList);
    }

    if ((!listItems || listItems.length === 0) && !errorMessage) {
      errorMessage = (
        <div className="filesystem__directory-list__item filesystem__directory-list__item--message">
          <em>{this.props.intl.formatMessage(MESSAGES.emptyDirectory)}</em>
        </div>
      );
    }

    return (
      <CustomScrollbars autoHeight autoHeightMin={0} autoHeightMax={this.props.maxHeight}>
        <div className="filesystem__directory-list context-menu__items__padding-surrogate">
          {parentDirectory}
          {errorMessage}
          {listItems}
        </div>
      </CustomScrollbars>
    );
  }
}

export default FilesystemBrowser;
