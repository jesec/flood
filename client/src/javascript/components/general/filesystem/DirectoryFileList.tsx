import classnames from 'classnames';
import React from 'react';

import type {TorrentContent, TorrentContentSelection, TorrentContentSelectionTree} from '@shared/types/TorrentContent';
import type {TorrentProperties} from '@shared/types/Torrent';

import {Checkbox} from '../../../ui';
import FileIcon from '../../icons/File';
import PriorityMeter from './PriorityMeter';
import Size from '../Size';
import TorrentActions from '../../../actions/TorrentActions';

interface DirectoryFilesProps {
  depth: number;
  hash: TorrentProperties['hash'];
  items: TorrentContentSelectionTree['files'];
  path: Array<string>;
  onPriorityChange: () => void;
  onItemSelect: (selection: TorrentContentSelection) => void;
}

const METHODS_TO_BIND = ['handlePriorityChange'] as const;

class DirectoryFiles extends React.Component<DirectoryFilesProps> {
  static defaultProps = {
    path: [],
    items: {},
  };

  constructor(props: DirectoryFilesProps) {
    super(props);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getCurrentPath(file: TorrentContent) {
    return [...this.props.path, file.filename];
  }

  getIcon(file: TorrentContent, isSelected: boolean) {
    const changeHandler = (): void => {
      this.handleFileSelect(file, isSelected);
    };

    return (
      <div className="file__checkbox directory-tree__checkbox">
        <div
          className="directory-tree__checkbox__item
          directory-tree__checkbox__item--checkbox">
          <Checkbox checked={isSelected} id={`${file.index}`} onChange={changeHandler} useProps />
        </div>
        <div
          className="directory-tree__checkbox__item
          directory-tree__checkbox__item--icon">
          <FileIcon />
        </div>
      </div>
    );
  }

  handleFileSelect(file: TorrentContent, isSelected: boolean): void {
    this.props.onItemSelect({
      type: 'file',
      depth: this.props.depth,
      path: this.getCurrentPath(file),
      select: !isSelected,
    });
  }

  handlePriorityChange(fileIndex: React.ReactText, priorityLevel: number) {
    this.props.onPriorityChange();
    TorrentActions.setFilePriority(this.props.hash, {indices: [Number(fileIndex)], priority: priorityLevel});
  }

  render() {
    if (this.props.items == null) {
      return null;
    }

    const files = Object.values(this.props.items)
      .sort((a, b) => a.filename.localeCompare(b.filename))
      .map((file) => {
        const isSelected =
          (this.props.items && this.props.items[file.filename] && this.props.items[file.filename].isSelected) || false;
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
              <div className="file__name">{file.filename}</div>
            </div>
            <div className="file__detail file__detail--secondary">
              <Size value={file.sizeBytes} precision={1} />
            </div>
            <div className="file__detail file__detail--secondary">{file.percentComplete}%</div>
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
