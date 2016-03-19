import React from 'react';

import File from '../icons/File';
import format from '../../util/formatData';
import PriorityMeter from './PriorityMeter';
import TorrentActions from '../../actions/TorrentActions';

const METHODS_TO_BIND = ['handlePriorityChange'];

export default class DirectoryFiles extends React.Component {
  constructor() {
    super();

    this.state = {
      files: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handlePriorityChange(fileIndex, priorityLevel) {
    TorrentActions.setFilePriority(this.props.hash, [fileIndex], priorityLevel);
  }

  render() {
    let branch = Object.assign([], this.props.branch);

    branch.sort((a, b) => {
      return a.filename.localeCompare(b.filename);
    });

    let files = branch.map((file, index) => {
      let fileSize = format.data(file.sizeBytes, '', 1);

      return (
        <div className="directory-tree__node directory-tree__node--file file"
          key={`${index}-${file.filename}`} title={file.filename}>
          <div className="file__detail file__name">
            <File />
            {file.filename}
          </div>
          <div className="file__detail file__detail--size">
            {fileSize.value}
            <em className="unit">{fileSize.unit}</em>
          </div>
          <div className="file__detail file__detail--size">
            {file.percentComplete}%
          </div>
          <div className="file__detail file__detail--priority">
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
