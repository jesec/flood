import React from 'react';

import FolderOpenSolid from '../icons/FolderOpenSolid';
import DirectoryTree from '../filesystem/DirectoryTree';
import File from '../icons/File';

const METHODS_TO_BIND = ['handleParentDirectoryClick'];

export default class TorrentFiles extends React.Component {
  constructor() {
    super();

    this.state = {
      expanded: true
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  constructDirectoryTree(tree = {}, directory, file, depth = 0) {
    if (depth < file.pathComponents.length - 1) {
      depth++;
      tree[directory] = this.constructDirectoryTree(
        tree[directory],
        file.pathComponents[depth],
        file,
        depth
      );
    } else {
      if (!tree.files) {
        tree.files = [];
      }
      tree.files.push(file);
    }
    return tree;
  }

  getFileList(files) {
    let tree = {};

    files.forEach((file) => {
      this.constructDirectoryTree(tree, file.pathComponents[0], file);
    });

    return <DirectoryTree tree={tree} depth={0} />;
  }

  getFileData(torrent, files) {

  }

  handleParentDirectoryClick() {
    this.setState({
      expanded: !this.state.expanded
    });
  }

  isLoaded() {
    if (this.props.files) {
      return true;
    }

    return false;
  }

  render() {
    let {files, torrent} = this.props;

    if (this.isLoaded()) {
      // We've received full file details from the client.
      let fileList = null;

      if (this.state.expanded) {
        fileList = this.getFileList(files);
      }

      return (
        <div className="directory-tree torrent-details__section">
          <div className="directory-tree__node directory-tree__parent-directory"
            onClick={this.handleParentDirectoryClick}>
            <FolderOpenSolid />
            {torrent.directory}
          </div>
          {fileList}
        </div>
      );
    } else {
      // We've only received the top-level file details from the torrent list.
      return (
        <div className="directory-tree torrent-details__section">
          <div className="directory-tree__node
            directory-tree__parent-directory">
            <FolderOpenSolid />
            {torrent.directory}
          </div>
          <div className="directory-tree__node directory-tree__node--file">
            <File />
            {torrent.filename}
          </div>
        </div>
      );
    }
  }
}
