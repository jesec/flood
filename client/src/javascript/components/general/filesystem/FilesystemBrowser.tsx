import {PureComponent, ReactNodeArray} from 'react';
import {Trans} from '@lingui/react';

import {Arrow, File, FolderClosedSolid} from '@client/ui/icons';
import FloodActions from '@client/actions/FloodActions';

const MESSAGES = {
  EACCES: 'filesystem.error.eacces',
  ENOENT: 'filesystem.error.enoent',
};

interface FilesystemBrowserProps {
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

class FilesystemBrowser extends PureComponent<FilesystemBrowserProps, FilesystemBrowserStates> {
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
    const {directory, selectable} = this.props;
    const {directories, errorResponse, files} = this.state;
    let errorMessage = null;
    let listItems = null;
    let parentDirectory = null;
    let shouldShowDirectoryList = true;

    if ((directories == null && selectable === 'directories') || (files == null && selectable === 'files')) {
      shouldShowDirectoryList = false;
      errorMessage = (
        <div className="filesystem__directory-list__item filesystem__directory-list__item--message">
          <em>
            <Trans id="filesystem.fetching" />
          </em>
        </div>
      );
    }

    if (errorResponse && errorResponse.data && errorResponse.data.code) {
      shouldShowDirectoryList = false;
      errorMessage = (
        <div className="filesystem__directory-list__item filesystem__directory-list__item--message">
          <em>
            <Trans id={MESSAGES[errorResponse.data.code as keyof typeof MESSAGES] || 'filesystem.error.unknown'} />
          </em>
        </div>
      );
    }

    if (directory) {
      parentDirectory = (
        <li
          className="filesystem__directory-list__item filesystem__directory-list__item--parent"
          onClick={this.handleParentDirectoryClick}>
          <Arrow />
          <Trans id="filesystem.parent.directory" />
        </li>
      );
    } else {
      shouldShowDirectoryList = false;
      errorMessage = (
        <div className="filesystem__directory-list__item filesystem__directory-list__item--message">
          <em>
            <Trans id="filesystem.error.no.input" />
          </em>
        </div>
      );
    }

    if (shouldShowDirectoryList) {
      const directoryList: ReactNodeArray =
        directories != null
          ? directories.map((subDirectory, index) => (
              <li
                className={`${'filesystem__directory-list__item filesystem__directory-list__item--directory'.concat(
                  selectable !== 'files' ? ' filesystem__directory-list__item--selectable' : '',
                )}`}
                // TODO: Find a better key
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                onClick={selectable !== 'files' ? () => this.handleItemClick(subDirectory) : undefined}>
                <FolderClosedSolid />
                {subDirectory}
              </li>
            ))
          : [];

      const filesList: ReactNodeArray =
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
          <em>
            <Trans id="filesystem.empty.directory" />
          </em>
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
