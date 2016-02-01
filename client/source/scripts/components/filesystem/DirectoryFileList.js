import React from 'react';

import File from '../icons/File';
import format from '../../util/formatData';

export default class DirectoryFiles extends React.Component {
  render() {
    let branch = Object.assign([], this.props.branch);

    branch.sort((a, b) => {
      return a.filename.localeCompare(b.filename);
    });

    let files = branch.map((file, fileIndex) => {
      let fileSize = format.data(file.sizeBytes, '', 1);

      return (
        <div className="directory-tree__node directory-tree__node--file file"
          key={`${fileIndex}`} title={file.filename}>
          <div className="file__detail file__name">
            <File />
            {file.filename}
          </div>
          <div className="file__detail file__size">
            {fileSize.value}
            <em className="unit">{fileSize.unit}</em>
          </div>
          <div className="file__detail file__priority">
            {file.priority}
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
