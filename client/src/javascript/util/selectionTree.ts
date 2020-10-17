import type {TorrentContent, TorrentContentSelection, TorrentContentSelectionTree} from '@shared/types/TorrentContent';

const selectAll = (tree: TorrentContentSelectionTree, isSelected: boolean): TorrentContentSelectionTree => {
  return {
    ...tree,
    ...(tree.directories != null
      ? {
          directories: Object.assign(
            {},
            ...Object.keys(tree.directories).map((directory) => {
              return tree.directories != null
                ? {
                    [directory]: selectAll(tree.directories[directory], isSelected),
                  }
                : {};
            }),
          ),
        }
      : {}),
    ...(tree.files != null
      ? {
          files: Object.assign(
            {},
            ...Object.keys(tree.files).map((file) => {
              return tree.files != null
                ? {
                    [file]: {
                      ...tree.files[file],
                      isSelected,
                    },
                  }
                : {};
            }),
          ),
        }
      : {}),
    isSelected,
  };
};

const applySelection = (
  tree: TorrentContentSelectionTree,
  item: TorrentContentSelection,
  recursiveDepth = 0,
): TorrentContentSelectionTree => {
  const {depth, path, select, type} = item;
  const currentPath = path[recursiveDepth];

  // Change happens
  if (recursiveDepth === depth - 1) {
    if (type === 'file' && tree.files != null && tree.files[currentPath] != null) {
      const files = {
        ...tree.files,
        [currentPath]: {
          ...tree.files[currentPath],
          isSelected: select,
        },
      };

      return {
        ...tree,
        files,
        isSelected:
          Object.values(files).every(({isSelected}) => isSelected) &&
          (tree.directories != null ? Object.values(tree.directories).every(({isSelected}) => isSelected) : true),
      };
    }

    if (type === 'directory' && tree.directories != null) {
      const directories = {
        ...tree.directories,
        [currentPath]: selectAll(tree.directories[currentPath], select),
      };

      return {
        ...tree,
        directories,
        isSelected:
          Object.values(directories).every(({isSelected}) => isSelected) &&
          (tree.files != null ? Object.values(tree.files).every(({isSelected}) => isSelected) : true),
      };
    }

    return tree;
  }

  // Recursive call till we reach the target
  if (tree.directories != null) {
    const selectionSubTree = tree.directories;
    Object.keys(selectionSubTree).forEach((directory) => {
      if (directory === currentPath) {
        selectionSubTree[directory] = applySelection(selectionSubTree[directory], item, recursiveDepth + 1);
      }
    });
    return {
      ...tree,
      directories: selectionSubTree,
      isSelected: Object.values(selectionSubTree).every(({isSelected}) => isSelected),
    };
  }

  return tree;
};

const getSelectionTree = (contents: Array<TorrentContent>, isSelected = true): TorrentContentSelectionTree => {
  const tree: TorrentContentSelectionTree = {isSelected};

  contents.forEach((content) => {
    const pathComponents = content.path.split('/');
    let currentDirectory = tree;

    while (pathComponents.length - 1) {
      const pathComponent = pathComponents.shift() as string;

      if (currentDirectory.directories == null) {
        currentDirectory.directories = {[pathComponent]: {isSelected}};
      } else {
        if (currentDirectory.directories[pathComponent] == null) {
          currentDirectory.directories[pathComponent] = {isSelected};
        }
        currentDirectory = currentDirectory.directories[pathComponent];
      }
    }

    if (currentDirectory.files == null) {
      currentDirectory.files = {[content.filename]: {...content, isSelected}};
    } else {
      currentDirectory.files[content.filename] = content;
    }
  });

  return tree;
};

const selectionTree = {
  selectAll,
  applySelection,
  getSelectionTree,
};

export default selectionTree;
