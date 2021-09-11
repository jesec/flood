import classnames from 'classnames';
import {FC, ReactText, useRef, useState} from 'react';

import {Checkbox} from '@client/ui';
import {Checkmark, Clipboard, File as FileIcon} from '@client/ui/icons';
import ConfigStore from '@client/stores/ConfigStore';
import TorrentActions from '@client/actions/TorrentActions';

import type {TorrentContentSelection, TorrentContentSelectionTree} from '@shared/types/TorrentContent';
import type {TorrentProperties} from '@shared/types/Torrent';

import PriorityMeter from '../PriorityMeter';
import Size from '../Size';

interface DirectoryFilesProps {
  depth: number;
  hash: TorrentProperties['hash'];
  items: TorrentContentSelectionTree['files'];
  path: Array<string>;
  onItemSelect: (selection: TorrentContentSelection) => void;
}

const DirectoryFiles: FC<DirectoryFilesProps> = ({depth, items, hash, path, onItemSelect}: DirectoryFilesProps) => {
  const [copiedToClipboard, setCopiedToClipboard] = useState<number | null>(null);
  const contentPermalinks = useRef<Record<number, string | null>>({});

  if (items == null) {
    return null;
  }

  const files = Object.values(items)
    .sort((a, b) => a.filename.localeCompare(b.filename))
    .map((file) => {
      const isSelected = (items && items[file.filename] && items[file.filename].isSelected) || false;
      const classes = classnames(
        'directory-tree__node file',
        'directory-tree__node--file directory-tree__node--selectable',
        {
          'directory-tree__node--selected': isSelected,
        },
      );

      return (
        <div className={classes} key={file.filename} title={file.filename}>
          <div className="file__label file__detail">
            <div className="file__checkbox directory-tree__checkbox">
              <div className="directory-tree__checkbox__item directory-tree__checkbox__item--checkbox">
                <Checkbox
                  checked={isSelected}
                  id={`${file.index}`}
                  onClick={() =>
                    onItemSelect({
                      type: 'file',
                      depth,
                      path: [...path, file.filename],
                      select: !isSelected,
                    })
                  }
                />
              </div>
              <div className="directory-tree__checkbox__item directory-tree__checkbox__item--icon">
                <FileIcon />
              </div>
            </div>
            <div className="file__name">
              {/* TODO: Add a WebAssembly decoding player if the feature is popular */}
              <a
                href={`${ConfigStore.baseURI}api/torrents/${hash}/contents/${file.index}/data`}
                style={{textDecoration: 'none'}}
                target="_blank"
                rel="noreferrer"
              >
                {file.filename}
              </a>
            </div>
          </div>
          <div className="file__detail file__detail--secondary">
            <Size value={file.sizeBytes} precision={1} />
          </div>
          <div className="file__detail file__detail--secondary">{Math.trunc(file.percentComplete)}%</div>
          <div
            className="file__detail file__detail--secondary
            file__detail--priority"
          >
            <PriorityMeter
              key={`${file.index}-${file.filename}`}
              level={file.priority}
              id={file.index}
              maxLevel={2}
              onChange={(fileIndex: ReactText, priorityLevel: number) =>
                TorrentActions.setFilePriority(hash, {
                  indices: [Number(fileIndex)],
                  priority: priorityLevel,
                })
              }
              priorityType="file"
            />
          </div>
          {typeof navigator.clipboard?.writeText === 'function' && (
            <button
              className="file__detail file__detail--secondary file__detail--clipboard"
              type="button"
              onClick={() => {
                const copy = (link: string): void => {
                  if (link !== '') {
                    if (typeof navigator.share === 'function') {
                      navigator
                        .share({
                          title: file.filename,
                          url: link,
                        })
                        .then(() => setCopiedToClipboard(file.index));
                    } else {
                      navigator.clipboard.writeText(link).then(() => setCopiedToClipboard(file.index));
                    }
                  }
                };
                // Safari does not support async operations inside "user gesture" handler.
                // Otherwise the write to clipboard will be rejected for "security reasons".
                // As such, we cache the token, so next click can be synchronous. Incompatible
                // morons make everyone's life hard.
                const link = contentPermalinks.current[file.index];
                if (link != null) {
                  copy(link);
                } else {
                  contentPermalinks.current[file.index] = '';
                  TorrentActions.getTorrentContentsDataPermalink(hash, [file.index]).then(
                    (url) => {
                      contentPermalinks.current[file.index] = url;
                      copy(url);
                    },
                    () => {
                      contentPermalinks.current[file.index] = null;
                    },
                  );
                }
              }}
            >
              {copiedToClipboard === file.index ? <Checkmark /> : <Clipboard />}
            </button>
          )}
        </div>
      );
    });

  return <div className="directory-tree__node directory-tree__node--file-list">{files}</div>;
};

export default DirectoryFiles;
