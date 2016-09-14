import classnames from 'classnames';
import React from 'react';

import Checkbox from '../FormElements/Checkbox';
import File from '../../Icons/File';
import PriorityMeter from './PriorityMeter';
import Size from '../Size';
import TorrentActions from '../../../actions/TorrentActions';

const ICONS = {file: <File />};
const METHODS_TO_BIND = ['handlePriorityChange'];

class DirectoryFiles extends React.Component {
  constructor() {
    super();

    this.state = {
      files: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getCurrentPath(file) {
    return [...this.props.path, file.filename];
  }

  getIcon(file, isSelected) {
    let changeHandler = (value, event) => {
      this.handleFileSelect(file, isSelected, event);
    };

    return (
      <div className="directory-tree__checkbox">
        <div className="directory-tree__checkbox__item
          directory-tree__checkbox__item--checkbox">
          <Checkbox checked={isSelected} onChange={changeHandler}
            useProps={true} />
        </div>
        <div className="directory-tree__checkbox__item
          directory-tree__checkbox__item--icon">
          {ICONS.file}
        </div>
      </div>
    );
  }

  handleFileSelect(file, isSelected, event) {
    this.props.onItemSelect({
      ...file,
      depth: this.props.depth,
      event,
      id: file.index,
      isParentSelected: this.props.isParentSelected,
      isSelected,
      path: this.getCurrentPath(file),
      type: 'file'
    });
  }

  handlePriorityChange(fileIndex, priorityLevel) {
    this.props.onPriorityChange();
    TorrentActions.setFilePriority(this.props.hash, [fileIndex], priorityLevel);
  }

  render() {
    let branch = Object.assign([], this.props.fileList);

    branch.sort((a, b) => {
      return a.filename.localeCompare(b.filename);
    });

    let files = branch.map((file, index) => {
      let isSelected = this.props.selectedItems[file.filename] && this.props.selectedItems[file.filename].isSelected;
      let classes = classnames('directory-tree__node file',
        'directory-tree__node--file directory-tree__node--selectable', {
          'directory-tree__node--selected': isSelected
        });

      return (
        <div className={classes} key={`${index}-${file.filename}`}
          title={file.filename}>
          <div className="file__detail file__name">
            {this.getIcon(file, isSelected)}
            {file.filename}
          </div>
          <div className="file__detail file__detail--secondary">
            <Size value={file.sizeBytes} precision={1} />
          </div>
          <div className="file__detail file__detail--secondary">
            {file.percentComplete}%
          </div>
          <div className="file__detail file__detail--secondary
            file__detail--priority">
            <PriorityMeter level={file.priority} id={file.index}
              maxLevel={2} onChange={this.handlePriorityChange} type="file"
              key={`${file.index}-${file.filename}`} />
          </div>
        </div>
      );
    });

    return (
      <div className="directory-tree__node directory-tree__node--file-list">
        {files}
      </div>
    );
  }
}

DirectoryFiles.defaultProps = {
  isParentSelected: false,
  path: [],
  selectedItems: {}
};

DirectoryFiles.propTypes = {
  isParentSelected: React.PropTypes.bool,
  path: React.PropTypes.array,
  selectedItems: React.PropTypes.object
};

export default DirectoryFiles;
