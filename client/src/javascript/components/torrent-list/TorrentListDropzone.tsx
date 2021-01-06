import {FC, ReactNode} from 'react';
import {useDropzone} from 'react-dropzone';

import SettingStore from '../../stores/SettingStore';
import TorrentActions from '../../actions/TorrentActions';

const handleFileDrop = (files: Array<File>) => {
  const filesData: Array<string> = [];

  const callback = (data: string) => {
    filesData.push(data);

    if (filesData.length === files.length && filesData[0] != null) {
      TorrentActions.addTorrentsByFiles({
        files: filesData as [string, ...string[]],
        destination:
          SettingStore.floodSettings.torrentDestinations?.[''] ?? SettingStore.clientSettings?.directoryDefault ?? '',
        isBasePath: false,
        start: SettingStore.floodSettings.startTorrentsOnLoad,
      });
    }
  };

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result != null && typeof e.target.result === 'string') {
        callback(e.target.result.split('base64,')[1]);
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
      className={`dropzone dropzone--with-overlay torrents ${isDragActive ? 'dropzone--is-dragging' : ''}`}>
      {children}
    </div>
  );
};

export default TorrentListDropzone;
