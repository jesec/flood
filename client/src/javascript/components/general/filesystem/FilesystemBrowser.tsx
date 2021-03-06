import {FC, memo, ReactNodeArray, useEffect, useState} from 'react';
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

const FilesystemBrowser: FC<FilesystemBrowserProps> = memo(
  ({directory, selectable, onItemSelection}: FilesystemBrowserProps) => {
    const [errorResponse, setErrorResponse] = useState<{data?: NodeJS.ErrnoException} | null>(null);
    const [separator, setSeparator] = useState<string>('/');
    const [directories, setDirectories] = useState<string[]>([]);
    const [files, setFiles] = useState<string[]>([]);

    useEffect(() => {
      if (!directory) {
        return;
      }

      FloodActions.fetchDirectoryList(directory)
        .then(({files: fetchedFiles, directories: fetchedDirectories, separator: fetchedSeparator}) => {
          setFiles(fetchedFiles);
          setDirectories(fetchedDirectories);
          setSeparator(fetchedSeparator);
          setErrorResponse(null);
        })
        .catch(({response}) => {
          setErrorResponse(response);
        });
    }, [directory]);

    let errorMessage = null;
    let listItems = null;
    let parentDirectoryElement = null;
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
      parentDirectoryElement = (
        <li
          className="filesystem__directory-list__item filesystem__directory-list__item--parent"
          onClick={() => {
            let parentDirectory = directory;

            if (directory.endsWith(separator)) {
              parentDirectory = directory.substring(0, directory.length - 1);
            }

            const directoryArr = directory.split(separator);
            directoryArr.pop();
            parentDirectory = directoryArr.join(separator);

            onItemSelection?.(parentDirectory);
          }}>
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
        directories?.map((subDirectory) => (
          <li
            className={`${'filesystem__directory-list__item filesystem__directory-list__item--directory'.concat(
              selectable !== 'files' ? ' filesystem__directory-list__item--selectable' : '',
            )}`}
            key={subDirectory}
            onClick={
              selectable !== 'files'
                ? () => {
                    onItemSelection?.(
                      directory?.endsWith(separator)
                        ? `${directory}${subDirectory}`
                        : `${directory}${separator}${subDirectory}`,
                      true,
                    );
                  }
                : undefined
            }>
            <FolderClosedSolid />
            {subDirectory}
          </li>
        )) ?? [];

      const filesList: ReactNodeArray =
        files?.map((file) => (
          <li
            className={`${'filesystem__directory-list__item filesystem__directory-list__item--file'.concat(
              selectable !== 'directories' ? ' filesystem__directory-list__item--selectable' : '',
            )}`}
            key={file}
            onClick={
              selectable !== 'directories'
                ? () => {
                    onItemSelection?.(
                      directory?.endsWith(separator) ? `${directory}${file}` : `${directory}${separator}${file}`,
                      false,
                    );
                  }
                : undefined
            }>
            <File />
            {file}
          </li>
        )) ?? [];

      listItems = [...directoryList, ...filesList];
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
        {parentDirectoryElement}
        {errorMessage}
        {listItems}
      </div>
    );
  },
);

FilesystemBrowser.defaultProps = {
  selectable: undefined,
  onItemSelection: undefined,
};

export default FilesystemBrowser;
