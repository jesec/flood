import {FC, ReactNode, useEffect} from 'react';
import {useDropzone} from 'react-dropzone';

import UIStore from '@client/stores/UIStore';
import processFiles from '@client/util/processFiles';

const handleFileDrop = (files: Array<File>) => {
  void processFiles(files).then((processedFiles) => {
    if (processedFiles.length > 0) {
      UIStore.setActiveModal({id: 'add-torrents', tab: 'by-file', files: processedFiles});
    }
  });
};

const TorrentListDropzone: FC<{children: ReactNode}> = ({children}: {children: ReactNode}) => {
  const {getRootProps, isDragActive} = useDropzone({
    onDrop: handleFileDrop,
    noClick: true,
    noKeyboard: true,
  });

  // When opened as the OS handler for a .torrent file, launchQueue buffers the launch until
  // a consumer registers, so a cold launch onto the login screen is still delivered once this
  // mounts post-auth.
  useEffect(() => {
    window.launchQueue?.setConsumer(({files}) => {
      if (files != null && files.length > 0) {
        void Promise.all(files.map((handle) => handle.getFile())).then(handleFileDrop);
      }
    });
  }, []);

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
