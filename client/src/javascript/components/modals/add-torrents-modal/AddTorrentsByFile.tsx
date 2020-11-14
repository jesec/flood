import {FC, useRef, useState} from 'react';
import {useIntl} from 'react-intl';

import AddTorrentsActions from './AddTorrentsActions';
import FileDropzone from '../../general/form-elements/FileDropzone';
import FilesystemBrowserTextbox from '../../general/form-elements/FilesystemBrowserTextbox';
import {Form, FormRow} from '../../../ui';
import {saveAddTorrentsUserPreferences} from '../../../util/userPreferences';
import SettingStore from '../../../stores/SettingStore';
import TagSelect from '../../general/form-elements/TagSelect';
import TorrentActions from '../../../actions/TorrentActions';
import UIStore from '../../../stores/UIStore';

import type {ProcessedFiles} from '../../general/form-elements/FileDropzone';

interface AddTorrentsByFileFormData {
  destination: string;
  start: boolean;
  tags: string;
  isBasePath: boolean;
  isCompleted: boolean;
}

const AddTorrentsByFile: FC = () => {
  const filesRef = useRef<ProcessedFiles>([]);
  const formRef = useRef<Form>(null);
  const textboxRef = useRef<HTMLInputElement>(null);
  const [isAddingTorrents, setIsAddingTorrents] = useState<boolean>(false);

  const intl = useIntl();

  return (
    <Form className="inverse" ref={formRef}>
      <FormRow>
        <FileDropzone
          onFilesChanged={(files) => {
            filesRef.current = files;
          }}
        />
      </FormRow>
      <FormRow>
        <TagSelect
          label={intl.formatMessage({
            id: 'torrents.add.tags',
          })}
          id="tags"
          onTagSelected={(tags) => {
            if (textboxRef.current != null) {
              const suggestedPath = SettingStore.floodSettings.torrentDestinations?.[tags[0]];
              if (typeof suggestedPath === 'string' && textboxRef.current != null) {
                textboxRef.current.value = suggestedPath;
                textboxRef.current.dispatchEvent(new Event('input', {bubbles: true}));
              }
            }
          }}
        />
      </FormRow>
      <FilesystemBrowserTextbox
        id="destination"
        label={intl.formatMessage({
          id: 'torrents.add.destination.label',
        })}
        ref={textboxRef}
        selectable="directories"
        showBasePathToggle
        showCompletedToggle
      />
      <AddTorrentsActions
        onAddTorrentsClick={() => {
          if (formRef.current == null) {
            return;
          }

          const formData = formRef.current?.getFormData();
          setIsAddingTorrents(true);

          const {destination, start, tags, isBasePath, isCompleted} = formData as Partial<AddTorrentsByFileFormData>;

          const filesData: Array<string> = [];
          filesRef.current.forEach((file) => {
            filesData.push(file.data);
          });

          if (filesData.length === 0 || destination == null) {
            setIsAddingTorrents(false);
            return;
          }

          const tagsArray = tags != null ? tags.split(',').filter((tag) => tag.length > 0) : undefined;

          TorrentActions.addTorrentsByFiles({
            files: filesData as [string, ...string[]],
            destination,
            tags: tagsArray,
            isBasePath,
            isCompleted,
            start,
          }).then(() => {
            UIStore.dismissModal();
          });

          saveAddTorrentsUserPreferences({
            start,
            destination,
            tags: tagsArray,
            tab: 'by-file',
          });
        }}
        isAddingTorrents={isAddingTorrents}
      />
    </Form>
  );
};

export default AddTorrentsByFile;
