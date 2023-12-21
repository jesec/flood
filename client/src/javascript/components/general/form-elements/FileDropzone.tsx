import Dropzone from 'react-dropzone';
import {FC, useEffect, useState} from 'react';
import {Trans} from '@lingui/react';

import {Close, File, Files} from '@client/ui/icons';
import {FormRowItem} from '@client/ui';

export type ProcessedFiles = Array<{name: string; data: string}>;

interface FileDropzoneProps {
  initialFiles?: ProcessedFiles;
  onFilesChanged: (files: ProcessedFiles) => void;
}

const FileDropzone: FC<FileDropzoneProps> = ({initialFiles, onFilesChanged}: FileDropzoneProps) => {
  const [files, setFiles] = useState<ProcessedFiles>(initialFiles ?? []);

  useEffect(() => {
    onFilesChanged(files);
  }, [files, onFilesChanged]);

  return (
    <FormRowItem>
      <span className="form__element__label">
        <Trans id="torrents.add.torrents.label" />
      </span>
      {files.length > 0 ? (
        <div
          onClick={(event) => {
            event.stopPropagation();
          }}
          role="none"
        >
          <ul className="dropzone__selected-files interactive-list">
            {files.map((file, index) => (
              <li className="dropzone__selected-files__file interactive-list__item" key={file.name} title={file.name}>
                <span className="interactive-list__icon">
                  <File />
                </span>
                <span className="interactive-list__label">{file.name}</span>
                <button
                  className="interactive-list__icon interactive-list__icon--action interactive-list__icon--action--warning"
                  type="button"
                  onClick={() => {
                    const newArray = files.slice();
                    newArray.splice(index, 1);
                    setFiles(newArray);
                  }}
                >
                  <Close />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <Dropzone
        onDrop={(addedFiles: Array<File>) => {
          const processedFiles: ProcessedFiles = [];
          addedFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result != null && typeof e.target.result === 'string') {
                processedFiles.push({
                  name: file.name,
                  data: e.target.result.split('base64,')[1],
                });
              }
              if (processedFiles.length === addedFiles.length) {
                setFiles(files.concat(processedFiles));
              }
            };
            reader.readAsDataURL(file);
          });
        }}
      >
        {({getRootProps, getInputProps, isDragActive}) => (
          <div
            {...getRootProps()}
            className={`form__dropzone dropzone interactive-list ${isDragActive ? 'dropzone--is-dragging' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="dropzone__copy">
              <div className="dropzone__icon">
                <Files />
              </div>
              <Trans id="torrents.add.tab.file.drop" />{' '}
              <span className="dropzone__browse-button">
                <Trans id="torrents.add.tab.file.browse" />
              </span>
              .
            </div>
          </div>
        )}
      </Dropzone>
    </FormRowItem>
  );
};

export default FileDropzone;
