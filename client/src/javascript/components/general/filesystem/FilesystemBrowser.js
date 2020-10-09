import React from 'react';
import {defineMessages} from 'react-intl';

import ArrowIcon from '../../icons/ArrowIcon';
import CustomScrollbars from '../CustomScrollbars';
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
});

class FilesystemBrowser extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      errorResponse: null,
      separator: '/',
    };
  }

  componentDidMount() {
    this.fetchDirectoryListForCurrentDirectory();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.directory !== this.props.directory) {
      this.fetchDirectoryListForCurrentDirectory();
    }
  }

  fetchDirectoryListForCurrentDirectory = () => {
    FloodActions.fetchDirectoryList({path: this.props.directory})
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

  getNewDestination(nextDirectorySegment) {
    const {separator} = this.state;
    const {directory} = this.props;

    if (directory.endsWith(separator)) {
      return `${directory}${nextDirectorySegment}`;
    }

    return `${directory}${separator}${nextDirectorySegment}`;
  }

  handleItemClick = (item, isDirectory = true) => {
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
    const {selectable} = this.props;
    const {directories, errorResponse, files = []} = this.state;
    let errorMessage = null;
    let listItems = null;
    let parentDirectory = null;
    let shouldShowDirectoryList = true;

    if (directories == null) {
      shouldShowDirectoryList = false;
      errorMessage = (
        <div className="filesystem__directory-list__item filesystem__directory-list__item--message">
          <em>{this.props.intl.formatMessage(MESSAGES.fetching)}</em>
        </div>
      );
    }

    if (errorResponse && errorResponse.data && errorResponse.data.code && MESSAGES[errorResponse.data.code]) {
      shouldShowDirectoryList = false;

      errorMessage = (
        <div className="filesystem__directory-list__item filesystem__directory-list__item--message">
          <em>{this.props.intl.formatMessage(MESSAGES[errorResponse.data.code])}</em>
        </div>
      );
    }

    parentDirectory = (
      <li
        className="filesystem__directory-list__item filesystem__directory-list__item--parent"
        onClick={this.handleParentDirectoryClick}>
        <ArrowIcon />
        {this.props.intl.formatMessage({
          id: 'filesystem.parent.directory',
        })}
      </li>
    );

    if (shouldShowDirectoryList) {
      const directoryList = directories.map((directory, index) => (
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
      ));

      const filesList = files.map((file, index) => (
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
