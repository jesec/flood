import {FC, ReactNode} from 'react';
import {useDropzone} from 'react-dropzone';

import UIStore from '@client/stores/UIStore';

import { processFiles } from '@client/util/fileProcessor';

const handleFileDrop = async (files: Array<File>) => {
  const processedFiles = await processFiles(files);
  if (processedFiles.length) {
    UIStore.setActiveModal({ id: 'add-torrents', tab: 'by-file', files: processedFiles });
  }
};

const TorrentListDropzone: FC<{children: ReactNode}> = ({children}: {children: ReactNode}) => {
  const {getRootProps, isDragActive} = useDropzone({
    onDrop: handleFileDrop,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div
      {...getRootProps({onClick: (evt) => evt.preventDefault()})}
      className={`dropzone dropzone--with-overlay torrents ${isDragActive ? 'dropzone--is-dragging' : ''}`}
    >
      {children}
    </div>
  );
};

export default TorrentListDropzone;
