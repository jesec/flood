import React from 'react';
import {defineMessages, WrappedComponentProps} from 'react-intl';

import ArrowIcon from '../../icons/ArrowIcon';
import File from '../../icons/File';
import FolderClosedSolid from '../../icons/FolderClosedSolid';
import FloodActions from '../../../actions/FloodActions';

const MESSAGES = defineMessages({
  EACCES: {
    id: 'filesystem.error.eacces',
  },
  ENOENT: {
    id: 'filesystem.error.enoent',
  },
  emptyDirectory: {
    id: 'filesystem.empty.directory',
  },
  fetching: {
    id: 'filesystem.fetching',
  },
  unknownError: {
    id: 'filesystem.error.unknown',
  },
});

interface FilesystemBrowserProps extends WrappedComponentProps {
  selectable?: 'files' | 'directories';
  directory: string;
  onItemSelection?: (newDestination: string, isDirectory?: boolean) => void;
}

interface FilesystemBrowserStates {
  errorResponse: {data?: NodeJS.ErrnoException} | null;
  separator: string;
  directories?: Array<string>;
  files?: Array<string>;
}

class FilesystemBrowser extends React.PureComponent<FilesystemBrowserProps, FilesystemBrowserStates> {
  constructor(props: FilesystemBrowserProps) {
    super(props);

    this.state = {
      errorResponse: null,
      separator: '/',
    };
  }

  componentDidMount(): void {
    this.fetchDirectoryListForCurrentDirectory();
  }

  componentDidUpdate(prevProps: FilesystemBrowserProps): void {
    const {directory} = this.props;

    if (prevProps.directory !== directory) {
      this.fetchDirectoryListForCurrentDirectory();
    }
  }

  getNewDestination(nextDirectorySegment: string): string {
    const {separator} = this.state;
    const {directory} = this.props;

    if (directory?.endsWith(separator)) {
      return `${directory}${nextDirectorySegment}`;
    }

    return `${directory}${separator}${nextDirectorySegment}`;
  }

  fetchDirectoryListForCurrentDirectory = (): void => {
    const {directory} = this.props;

    FloodActions.fetchDirectoryList({path: directory})
      .then((response) => {
        this.setState({
          ...response,
          errorResponse: null,
        });
      })
      .catch((error) => {
        this.setState({errorResponse: error.response});
      });
  };

  handleItemClick = (item: string, isDirectory = true) => {
    if (this.props.onItemSelection) {
      this.props.onItemSelection(this.getNewDestination(item), isDirectory);
    }
  };

  handleParentDirectoryClick = () => {
    const {separator} = this.state;
    let {directory} = this.props;

    if (directory.endsWith(separator)) {
      directory = directory.substring(0, directory.length - 1);
    }

    const directoryArr = directory.split(separator);
    directoryArr.pop();

    directory = directoryArr.join(separator);

    if (this.props.onItemSelection) {
      this.props.onItemSelection(directory);
    }
  };

  render() {
    const {intl, selectable} = this.props;
    const {directories, errorResponse, files} = this.state;
    let errorMessage = null;
    let listItems = null;
    let parentDirectory = null;
    let shouldShowDirectoryList = true;

    if ((directories == null && selectable === 'directories') || (files == null && selectable === 'files')) {
      shouldShowDirectoryList = false;
      errorMessage = (
        <div className="filesystem__directory-list__item filesystem__directory-list__item--message">
          <em>{intl.formatMessage(MESSAGES.fetching)}</em>
        </div>
      );
    }

    if (errorResponse && errorResponse.data && errorResponse.data.code) {
      shouldShowDirectoryList = false;

      const messageConfig = MESSAGES[errorResponse.data.code as keyof typeof MESSAGES] || MESSAGES.unknownError;

      errorMessage = (
        <div className="filesystem__directory-list__item filesystem__directory-list__item--message">
          <em>{intl.formatMessage(messageConfig)}</em>
        </div>
      );
    }

    parentDirectory = (
      <li
        className="filesystem__directory-list__item filesystem__directory-list__item--parent"
        onClick={this.handleParentDirectoryClick}>
        <ArrowIcon />
        {intl.formatMessage({
          id: 'filesystem.parent.directory',
        })}
      </li>
    );

    if (shouldShowDirectoryList) {
      const directoryList: React.ReactNodeArray =
        directories != null
          ? directories.map((directory, index) => (
              <li
                className={`${'filesystem__directory-list__item filesystem__directory-list__item--directory'.concat(
                  selectable !== 'files' ? ' filesystem__directory-list__item--selectable' : '',
                )}`}
                // TODO: Find a better key
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                onClick={selectable !== 'files' ? () => this.handleItemClick(directory) : undefined}>
                <FolderClosedSolid />
                {directory}
              </li>
            ))
          : [];

      const filesList: React.ReactNodeArray =
        files != null
          ? files.map((file, index) => (
              <li
                className={`${'filesystem__directory-list__item filesystem__directory-list__item--file'.concat(
                  selectable !== 'directories' ? ' filesystem__directory-list__item--selectable' : '',
                )}`}
                // TODO: Find a better key
                // eslint-disable-next-line react/no-array-index-key
                key={`file.${index}`}
                onClick={selectable !== 'directories' ? () => this.handleItemClick(file, false) : undefined}>
                <File />
                {file}
              </li>
            ))
          : [];

      listItems = directoryList.concat(filesList);
    }

    if ((!listItems || listItems.length === 0) && !errorMessage) {
      errorMessage = (
        <div className="filesystem__directory-list__item filesystem__directory-list__item--message">
          <em>{intl.formatMessage(MESSAGES.emptyDirectory)}</em>
        </div>
      );
    }

    return (
      <div className="filesystem__directory-list context-menu__items__padding-surrogate">
        {parentDirectory}
        {errorMessage}
        {listItems}
      </div>
    );
  }
}

export default FilesystemBrowser;
