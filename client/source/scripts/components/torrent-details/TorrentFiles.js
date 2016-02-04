import React from 'react';

import Disk from '../icons/Disk';
import DirectoryTree from '../filesystem/DirectoryTree';
import File from '../icons/File';

export default class TorrentFiles extends React.Component {
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

  getFileData(torrent) {
    return (
      <div className="directory-tree__node directory-tree__node--file">
        <File />
        {torrent.filename}
      </div>
    );
  }

  getFileList(files) {
    let tree = {};

    files.forEach((file) => {
      this.constructDirectoryTree(tree, file.pathComponents[0], file);
    });

    return <DirectoryTree tree={tree} depth={0} />;
  }

  isLoaded() {
    if (this.props.files) {
      return true;
    }

    return false;
  }

  render() {
    let {files, torrent} = this.props;
    let fileInfo = null;

    let directoryHeading = (
      <div className="directory-tree__node
        directory-tree__parent-directory torrent-details__section__heading">
        <Disk />
        {torrent.directory}
      </div>
    );

    if (this.isLoaded()) {
      fileInfo = this.getFileList(files);
    } else if (torrent.filename) {
      fileInfo = this.getFileData(torrent);
    }

    return (
      <div className="directory-tree torrent-details__section">
        {directoryHeading}
        {fileInfo}
      </div>
    );
  }
}
