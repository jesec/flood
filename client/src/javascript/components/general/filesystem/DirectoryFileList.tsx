import classnames from 'classnames';
import {Component, ReactText} from 'react';

import {Checkbox} from '@client/ui';
import ConfigStore from '@client/stores/ConfigStore';
import {File as FileIcon} from '@client/ui/icons';
import TorrentActions from '@client/actions/TorrentActions';

import type {TorrentContent, TorrentContentSelection, TorrentContentSelectionTree} from '@shared/types/TorrentContent';
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

class DirectoryFiles extends Component<DirectoryFilesProps> {
  static defaultProps = {
    path: [],
    items: {},
  };

  getCurrentPath(file: TorrentContent) {
    const {path} = this.props;

    return [...path, file.filename];
  }

  getIcon(file: TorrentContent, isSelected: boolean) {
    return (
      <div className="file__checkbox directory-tree__checkbox">
        <div
          className="directory-tree__checkbox__item
          directory-tree__checkbox__item--checkbox">
          <Checkbox checked={isSelected} id={`${file.index}`} onClick={() => this.handleFileSelect(file, isSelected)} />
        </div>
        <div
          className="directory-tree__checkbox__item
          directory-tree__checkbox__item--icon">
          <FileIcon />
        </div>
      </div>
    );
  }

  handlePriorityChange = (fileIndex: ReactText, priorityLevel: number): void => {
    const {hash} = this.props;

    TorrentActions.setFilePriority(hash, {
      indices: [Number(fileIndex)],
      priority: priorityLevel,
    });
  };

  handleFileSelect = (file: TorrentContent, isSelected: boolean): void => {
    const {depth, onItemSelect} = this.props;

    onItemSelect({
      type: 'file',
      depth,
      path: this.getCurrentPath(file),
      select: !isSelected,
    });
  };

  render() {
    const {items, hash} = this.props;

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
              {this.getIcon(file, isSelected)}
              <div className="file__name">
                {/* TODO: Add a WebAssembly decoding player if the feature is popular */}
                <a
                  href={`${ConfigStore.baseURI}api/torrents/${hash}/contents/${file.index}/data`}
                  style={{textDecoration: 'none'}}
                  target="_blank"
                  rel="noreferrer">
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
            file__detail--priority">
              <PriorityMeter
                key={`${file.index}-${file.filename}`}
                level={file.priority}
                id={file.index}
                maxLevel={2}
                onChange={this.handlePriorityChange}
                priorityType="file"
              />
            </div>
          </div>
        );
      });

    return <div className="directory-tree__node directory-tree__node--file-list">{files}</div>;
  }
}

export default DirectoryFiles;
