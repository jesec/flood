import {FC, ReactNode} from 'react';
import {useDropzone} from 'react-dropzone';

import UIStore from '@client/stores/UIStore';

import type {ProcessedFiles} from '@client/components/general/form-elements/FileDropzone';

const handleFileDrop = (files: Array<File>) => {
  const processedFiles: ProcessedFiles = [];

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result != null && typeof e.target.result === 'string') {
        processedFiles.push({
          name: file.name,
          data: e.target.result.split('base64,')[1],
        });
      }

      if (processedFiles.length === files.length && processedFiles[0] != null) {
        UIStore.setActiveModal({id: 'add-torrents', tab: 'by-file', files: processedFiles});
      }
    };
    reader.readAsDataURL(file);
  });
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
