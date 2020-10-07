import truncateTo from './numberUtils';

const processFile = (file) => {
  file.filename = file.pathComponents[file.pathComponents.length - 1];
  file.percentComplete = truncateTo((file.completedChunks / file.sizeChunks) * 100);
  file.priority = Number(file.priority);
  file.sizeBytes = Number(file.sizeBytes);

  delete file.completedChunks;
  delete file.pathComponents;
  delete file.sizeChunks;

  return file;
};

export const getFileTreeFromPathsArr = (tree, directory, file, depth) => {
  if (depth == null) {
    depth = 0;
  }

  if (tree == null) {
    tree = {};
  }

  if (depth++ < file.pathComponents.length - 1) {
    if (!tree.directories) {
      tree.directories = {};
    }

    tree.directories[directory] = getFileTreeFromPathsArr(
      tree.directories[directory],
      file.pathComponents[depth],
      file,
      depth,
    );
  } else {
    if (!tree.files) {
      tree.files = [];
    }

    tree.files.push(processFile(file));
  }

  return tree;
};
