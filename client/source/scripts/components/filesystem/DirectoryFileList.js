import React from 'react';

import File from '../icons/File';

export default class DirectoryFiles extends React.Component {
  render() {
    let branch = Object.assign([], this.props.branch);

    branch.sort((a, b) => {
      return a.filename.localeCompare(b.filename);
    });

    let files = branch.map((file, fileIndex) => {
      return (
        <div className="directory-tree__node directory-tree__node--file"
          key={`${fileIndex}`} title={file.filename}>
          <File />
          {file.filename}
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
