import {css} from '@emotion/react';
import {darken, lighten, rgba, saturate} from 'polished';
import {FC, memo, ReactNodeArray, useEffect, useState} from 'react';
import sort from 'fast-sort';
import {Trans} from '@lingui/react';

import {Arrow, File, FolderClosedOutlined, FolderClosedSolid, FolderOpenSolid} from '@client/ui/icons';
import FloodActions from '@client/actions/FloodActions';
import termMatch from '@client/util/termMatch';

const foregroundColor = '#5E728C';

const headerStyle = css({
  borderBottom: `1px solid ${lighten(0.43, foregroundColor)}`,
  marginBottom: '3px',
  paddingBottom: '3px',
  opacity: 0.75,
  '&:last-child': {
    marginBottom: 0,
  },
});

const listItemStyle = css({
  opacity: 0.5,
  padding: '3px 9px',
  transition: 'color 0.25s',
  whiteSpace: 'nowrap',
});

const listItemSelectableStyle = css({
  opacity: 1,
  cursor: 'pointer',
  transition: 'background 0.25s, color 0.25s',
  userSelect: 'none',
  '&:hover': {
    color: saturate(0.1, darken(0.15, foregroundColor)),
    background: rgba(foregroundColor, 0.1),
  },
});

const MESSAGES = {
  EACCES: 'filesystem.error.eacces',
  ENOENT: 'filesystem.error.enoent',
};

interface FilesystemBrowserProps {
  selectable?: 'files' | 'directories';
  directory: string;
  onItemSelection?: (newDestination: string, shouldKeepOpen?: boolean) => void;
}

const FilesystemBrowser: FC<FilesystemBrowserProps> = memo(
  ({directory, selectable, onItemSelection}: FilesystemBrowserProps) => {
    const [errorResponse, setErrorResponse] = useState<{data?: NodeJS.ErrnoException} | null>(null);
    const [separator, setSeparator] = useState<string>(directory.includes('/') ? '/' : '\\');
    const [directories, setDirectories] = useState<string[] | null>(null);
    const [files, setFiles] = useState<string[] | null>(null);

    const lastSegmentIndex = directory.lastIndexOf(separator) + 1;
    const currentDirectory = lastSegmentIndex > 0 ? directory.substr(0, lastSegmentIndex) : directory;
    const lastSegment = directory.substr(lastSegmentIndex);

    useEffect(() => {
      if (!currentDirectory) {
        return;
      }

      setDirectories(null);
      setFiles(null);

      FloodActions.fetchDirectoryList(currentDirectory)
        .then(({files: fetchedFiles, directories: fetchedDirectories, separator: fetchedSeparator}) => {
          setDirectories(fetchedDirectories);
          setFiles(fetchedFiles);
          setSeparator(fetchedSeparator);
          setErrorResponse(null);
        })
        .catch(({response}) => {
          setErrorResponse(response);
        });
    }, [currentDirectory]);

    let errorMessage: string | null = null;
    let listItems = null;

    if ((directories == null && selectable === 'directories') || (files == null && selectable === 'files')) {
      errorMessage = 'filesystem.fetching';
    }

    if (errorResponse && errorResponse.data && errorResponse.data.code) {
      errorMessage = MESSAGES[errorResponse.data.code as keyof typeof MESSAGES] || 'filesystem.error.unknown';
    }

    if (!directory) {
      errorMessage = 'filesystem.error.no.input';
    } else {
      const parentDirectory = `${currentDirectory.split(separator).slice(0, -2).join(separator)}${separator}`;
      const parentDirectoryElement = (
        <li
          css={[
            listItemStyle,
            listItemSelectableStyle,
            {
              '@media (max-width: 720px)': headerStyle,
            },
          ]}
          key={parentDirectory}
          onClick={selectable !== 'files' ? () => onItemSelection?.(parentDirectory, true) : undefined}>
          <Arrow css={{transform: 'scale(0.75) rotate(180deg)'}} />
          ..
        </li>
      );

      const directoryMatched = lastSegment ? termMatch(directories, (subDirectory) => subDirectory, lastSegment) : [];
      const directoryList: ReactNodeArray =
        (directories?.length &&
          sort(directories.slice())
            .desc((subDirectory) => directoryMatched.includes(subDirectory))
            .map((subDirectory) => {
              const destination = `${currentDirectory}${subDirectory}${separator}`;
              return (
                <li
                  css={[
                    listItemStyle,
                    selectable !== 'files' ? listItemSelectableStyle : undefined,
                    directoryMatched.includes(subDirectory) ? {fontWeight: 'bold'} : undefined,
                  ]}
                  key={destination}
                  onClick={selectable !== 'files' ? () => onItemSelection?.(destination, true) : undefined}>
                  <FolderClosedSolid />
                  {subDirectory}
                </li>
              );
            })) ||
        [];

      const fileMatched = lastSegment ? termMatch(files, (file) => file, lastSegment) : [];
      const fileList: ReactNodeArray =
        (files?.length &&
          sort(files.slice())
            .desc((file) => fileMatched.includes(file))
            .map((file) => {
              const destination = `${currentDirectory}${file}`;
              return (
                <li
                  css={[
                    listItemStyle,
                    selectable !== 'directories' ? listItemSelectableStyle : undefined,
                    fileMatched.includes(file) ? {fontWeight: 'bold'} : undefined,
                  ]}
                  key={destination}
                  onClick={selectable !== 'directories' ? () => onItemSelection?.(destination, false) : undefined}>
                  <File />
                  {file}
                </li>
              );
            })) ||
        [];

      if (directoryList.length === 0 && fileList.length === 0 && !errorMessage) {
        errorMessage = 'filesystem.empty.directory';
      }

      const inputDirectoryElement =
        !directoryMatched.includes(lastSegment) && selectable === 'directories' && lastSegment && !errorMessage
          ? (() => {
              const inputDestination = `${currentDirectory}${lastSegment}${separator}`;
              return [
                <li
                  css={[
                    listItemStyle,
                    listItemSelectableStyle,
                    {fontWeight: 'bold', '@media (max-width: 720px)': {display: 'none'}},
                  ]}
                  key={inputDestination}
                  onClick={() => onItemSelection?.(inputDestination, false)}>
                  <FolderClosedOutlined />
                  <span css={{whiteSpace: 'pre-wrap'}}>{lastSegment}</span>
                  <em css={{fontWeight: 'lighter'}}>
                    {' - '}
                    <Trans id="filesystem.error.enoent" />
                  </em>
                </li>,
              ];
            })()
          : [];

      listItems = [parentDirectoryElement, ...inputDirectoryElement, ...directoryList, ...fileList];
    }

    return (
      <div
        css={{
          color: foregroundColor,
          listStyle: 'none',
          padding: '3px 0px',
          '.icon': {
            fill: 'currentColor',
            height: '14px',
            width: '14px',
            marginRight: `${25 * (1 / 5)}px`,
            marginTop: '-3px',
            verticalAlign: 'middle',
          },
        }}>
        {currentDirectory && (
          <li
            css={[
              listItemStyle,
              headerStyle,
              {
                whiteSpace: 'pre-wrap',
                '.icon': {
                  transform: 'scale(0.9)',
                  marginTop: '-2px !important',
                },
                '@media (max-width: 720px)': {
                  display: 'none',
                },
              },
            ]}>
            <FolderOpenSolid />
            {currentDirectory}
          </li>
        )}
        {listItems}
        {errorMessage && (
          <div css={[listItemStyle, {opacity: 1}]}>
            <em>
              <Trans id={errorMessage} />
            </em>
          </div>
        )}
      </div>
    );
  },
);

FilesystemBrowser.defaultProps = {
  selectable: undefined,
  onItemSelection: undefined,
};

export default FilesystemBrowser;
