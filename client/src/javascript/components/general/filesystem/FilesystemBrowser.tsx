import {css} from '@client/styled-system/css';
import {FC, memo, ReactNodeArray, useEffect, useRef, useState} from 'react';
import {sort} from 'fast-sort';
import {Trans} from '@lingui/react';
import {useKey} from 'react-use';

import {Arrow, File, FolderClosedOutlined, FolderClosedSolid, FolderOpenSolid} from '@client/ui/icons';
import FloodActions from '@client/actions/FloodActions';
import termMatch from '@client/util/termMatch';

const foregroundColor = '#5E728C';
const borderColor = '#dde2e8'; // lighten(0.43, foregroundColor)
const hoverColor = '#374c66'; // saturate(0.1, darken(0.15, foregroundColor))
const hoverBackground = 'rgba(94, 114, 140, 0.1)'; // rgba(foregroundColor, 0.1)

const itemPaddingStyle = css.raw({padding: '3px 9px'});

const headerStyle = css.raw({
  borderBottom: `1px solid ${borderColor}`,
  marginBottom: '3px',
  paddingBottom: '3px',
  opacity: 0.75,
  _last: {
    marginBottom: 0,
  },
});

const baseListItemStyle = css.raw({
  transition: 'color 0.25s',
  whiteSpace: 'nowrap',
  '& button': {
    width: '100%',
    height: '100%',
    textAlign: 'left',
    _disabled: {
      pointerEvents: 'none',
    },
    ...itemPaddingStyle,
  },
});

const listItemStyle = css({
  opacity: 0.5,
  ...baseListItemStyle,
});

const listItemSelectableActiveStyle = css.raw({
  color: hoverColor,
  background: hoverBackground,
  '& button:focus': {
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
});

const listItemSelectableStyle = css({
  opacity: 1,
  cursor: 'pointer',
  transition: 'background 0.25s, color 0.25s',
  userSelect: 'none',
  _hover: listItemSelectableActiveStyle,
  _focusWithin: listItemSelectableActiveStyle,
  ...baseListItemStyle,
});

const MESSAGES = {
  EACCES: 'filesystem.error.eacces',
  ENOENT: 'filesystem.error.enoent',
};

interface FilesystemBrowserProps {
  selectable?: 'files' | 'directories';
  directory: string;
  onItemSelection?: (newDestination: string, shouldKeepOpen?: boolean) => void;
  onYieldFocus?: () => void;
}

const FilesystemBrowser: FC<FilesystemBrowserProps> = memo(
  ({directory, selectable, onItemSelection, onYieldFocus}: FilesystemBrowserProps) => {
    const [cursor, setCursor] = useState<number | null>(null);
    const [errorResponse, setErrorResponse] = useState<{data?: NodeJS.ErrnoException} | null>(null);
    const [separator, setSeparator] = useState<string>(directory.includes('/') ? '/' : '\\');
    const [directories, setDirectories] = useState<string[] | null>(null);
    const [files, setFiles] = useState<string[] | null>(null);

    const listRef = useRef<HTMLUListElement>(null);

    const lastSegmentIndex = directory.lastIndexOf(separator) + 1;
    const currentDirectory = lastSegmentIndex > 0 ? directory.substr(0, lastSegmentIndex) : directory;
    const lastSegment = directory.substr(lastSegmentIndex);

    useEffect(() => {
      if (!currentDirectory) {
        return;
      }

      setCursor(null);
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

    useEffect(() => {
      if (listRef.current != null && cursor != null) {
        const element = (listRef.current.children[cursor] as HTMLLIElement)?.children[0] as HTMLDivElement;
        if (element?.tabIndex === 0) {
          element.focus();
        } else {
          setCursor(
            Array.from(listRef.current.children).findIndex((e) => (e.children[0] as HTMLDivElement).tabIndex === 0),
          );
        }
      }
    }, [cursor]);

    useKey('ArrowUp', (e) => {
      e.preventDefault();
      setCursor((prevCursor) => {
        if (prevCursor == null || prevCursor - 1 < 0) {
          onYieldFocus?.();
          return null;
        }

        return prevCursor - 1;
      });
    });

    useKey('ArrowDown', (e) => {
      e.preventDefault();
      setCursor((prevCursor) => {
        if (prevCursor != null) {
          return prevCursor + 1;
        }
        return 0;
      });
    });

    let errorMessage: string | null = null;
    let listItems: ReactNodeArray = [];

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
          className={`${listItemSelectableStyle} ${css({
            '@media (max-width: 720px)': headerStyle,
          })}`}
          key={parentDirectory}
        >
          <button type="button" onClick={() => onItemSelection?.(parentDirectory, true)}>
            <Arrow className={css({transform: 'scale(0.75) rotate(180deg)'})} />
            ..
          </button>
        </li>
      );

      const isDirectorySelectable = selectable !== 'files';
      const directoryMatched = lastSegment ? termMatch(directories, (subDirectory) => subDirectory, lastSegment) : [];

      const inputDirectoryElement =
        !directoryMatched.includes(lastSegment) && selectable === 'directories' && lastSegment && !errorMessage
          ? (() => {
              const inputDestination = `${currentDirectory}${lastSegment}${separator}`;
              return [
                <li
                  className={`${listItemSelectableStyle} ${css({
                    '@media (max-width: 720px)': {display: 'none'},
                  })}`}
                  style={{fontWeight: 'bold'}}
                  key={inputDestination}
                >
                  <button type="button" onClick={() => onItemSelection?.(inputDestination, false)}>
                    <FolderClosedOutlined />
                    <span style={{whiteSpace: 'pre-wrap'}}>{lastSegment}</span>
                    <em style={{fontWeight: 'lighter'}}>
                      {' - '}
                      <Trans id="filesystem.error.enoent" />
                    </em>
                  </button>
                </li>,
              ];
            })()
          : [];

      const directoryList: ReactNodeArray =
        (directories?.length &&
          sort(directories.slice())
            .desc((subDirectory) => directoryMatched.includes(subDirectory))
            .map((subDirectory) => {
              const destination = `${currentDirectory}${subDirectory}${separator}`;
              return (
                <li
                  className={isDirectorySelectable ? listItemSelectableStyle : listItemStyle}
                  style={directoryMatched.includes(subDirectory) ? {fontWeight: 'bold'} : undefined}
                  key={destination}
                >
                  <button
                    type="button"
                    disabled={!isDirectorySelectable}
                    tabIndex={isDirectorySelectable ? 0 : -1}
                    onClick={isDirectorySelectable ? () => onItemSelection?.(destination, true) : undefined}
                  >
                    <FolderClosedSolid />
                    {subDirectory}
                  </button>
                </li>
              );
            })) ||
        [];

      const isFileSelectable = selectable !== 'directories';
      const fileMatched = lastSegment ? termMatch(files, (file) => file, lastSegment) : [];
      const fileList: ReactNodeArray =
        (files?.length &&
          sort(files.slice())
            .desc((file) => fileMatched.includes(file))
            .map((file) => {
              const destination = `${currentDirectory}${file}`;
              return (
                <li
                  className={isFileSelectable ? listItemSelectableStyle : listItemStyle}
                  style={fileMatched.includes(file) ? {fontWeight: 'bold'} : undefined}
                  key={destination}
                >
                  <button
                    type="button"
                    disabled={!isFileSelectable}
                    tabIndex={isFileSelectable ? 0 : -1}
                    onClick={isFileSelectable ? () => onItemSelection?.(destination, false) : undefined}
                  >
                    <File />
                    {file}
                  </button>
                </li>
              );
            })) ||
        [];

      if (directoryList.length === 0 && fileList.length === 0 && !errorMessage) {
        errorMessage = 'filesystem.empty.directory';
      }

      listItems = [parentDirectoryElement, ...inputDirectoryElement, ...directoryList, ...fileList];
    }

    return (
      <div
        className={css({
          color: foregroundColor,
          listStyle: 'none',
          padding: '3px 0px',
          '& .icon': {
            fill: 'currentColor',
            height: '14px',
            width: '14px',
            marginRight: '5px',
            marginTop: '-3px',
            verticalAlign: 'middle',
          },
        })}
      >
        {currentDirectory && (
          <li
            className={`${listItemStyle} ${css(headerStyle, itemPaddingStyle, {
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              '& .icon': {
                transform: 'scale(0.9)',
                marginTop: '-2px !important',
              },
              '@media (max-width: 720px)': {
                display: 'none',
              },
            })}`}
          >
            <FolderOpenSolid />
            {currentDirectory}
          </li>
        )}
        <ul ref={listRef}>{listItems}</ul>
        {errorMessage && (
          <div className={`${listItemStyle} ${css(itemPaddingStyle)}`} style={{opacity: 1}}>
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
  onYieldFocus: undefined,
};

export default FilesystemBrowser;
