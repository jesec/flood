import Dropzone from 'react-dropzone';
import {FormattedMessage} from 'react-intl';
import {FC, useEffect, useState} from 'react';

import CloseIcon from '../../icons/Close';
import FileIcon from '../../icons/File';
import FilesIcon from '../../icons/Files';
import {FormRowItem} from '../../../ui';

export type ProcessedFiles = Array<{name: string; data: string}>;

interface FileDropzoneProps {
  onFilesChanged: (files: ProcessedFiles) => void;
}

const FileDropzone: FC<FileDropzoneProps> = ({onFilesChanged}: FileDropzoneProps) => {
  const [files, setFiles] = useState<ProcessedFiles>([]);

  useEffect(() => {
    onFilesChanged(files);
  }, [files, onFilesChanged]);

  return (
    <FormRowItem>
      <label className="form__element__label">
        <FormattedMessage id="torrents.add.torrents.label" />
      </label>
      {files.length > 0 ? (
        <ul
          className="dropzone__selected-files interactive-list"
          onClick={(event) => {
            event.stopPropagation();
          }}>
          {files.map((file, index) => (
            <li className="dropzone__selected-files__file interactive-list__item" key={file.name} title={file.name}>
              <span className="interactive-list__icon">
                <FileIcon />
              </span>
              <span className="interactive-list__label">{file.name}</span>
              <span
                className="interactive-list__icon interactive-list__icon--action interactive-list__icon--action--warning"
                onClick={() => {
                  const newArray = files.slice();
                  newArray.splice(index, 1);
                  setFiles(newArray);
                }}>
                <CloseIcon />
              </span>
            </li>
          ))}
        </ul>
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
        }}>
        {({getRootProps, getInputProps, isDragActive}) => (
          <div
            {...getRootProps()}
            className={`form__dropzone dropzone interactive-list ${isDragActive ? 'dropzone--is-dragging' : ''}`}>
            <input {...getInputProps()} />
            <div className="dropzone__copy">
              <div className="dropzone__icon">
                <FilesIcon />
              </div>
              <FormattedMessage id="torrents.add.tab.file.drop" />{' '}
              <span className="dropzone__browse-button">
                <FormattedMessage id="torrents.add.tab.file.browse" />
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
