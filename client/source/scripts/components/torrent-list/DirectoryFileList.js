import React from 'react';

import Icon from '../icons/Icon';

export default class DirectoryFiles extends React.Component {
  render() {
    let branch = Object.assign([], this.props.branch);

    branch.sort((a, b) => {
      return a.filename.localeCompare(b.filename);
    });

    let files = branch.map((file, fileIndex) => {
      return (
        <div className="directory-tree__node directory-tree__node--file"
          key={`${fileIndex}`}>
          <Icon icon="file" />
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
