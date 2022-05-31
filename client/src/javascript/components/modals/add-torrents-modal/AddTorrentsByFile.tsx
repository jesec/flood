import {FC, useRef, useState} from 'react';
import {useLingui} from '@lingui/react';

import {Form, FormRow} from '@client/ui';
import {saveAddTorrentsUserPreferences} from '@client/util/userPreferences';
import SettingStore from '@client/stores/SettingStore';
import TorrentActions from '@client/actions/TorrentActions';
import UIStore from '@client/stores/UIStore';

import AddTorrentsActions from './AddTorrentsActions';
import FileDropzone from '../../general/form-elements/FileDropzone';
import FilesystemBrowserTextbox from '../../general/form-elements/FilesystemBrowserTextbox';
import TagSelect from '../../general/form-elements/TagSelect';

import type {ProcessedFiles} from '../../general/form-elements/FileDropzone';

interface AddTorrentsByFileFormData {
  destination: string;
  start: boolean;
  tags: string;
  isBasePath: boolean;
  isCompleted: boolean;
  isSequential: boolean;
}

const AddTorrentsByFile: FC = () => {
  const filesRef = useRef<ProcessedFiles>([]);
  const formRef = useRef<Form>(null);
  const textboxRef = useRef<HTMLInputElement>(null);
  const [isAddingTorrents, setIsAddingTorrents] = useState<boolean>(false);

  const {i18n} = useLingui();

  return (
    <Form className="inverse" ref={formRef}>
      <FormRow>
        <FileDropzone
          initialFiles={
            (UIStore.activeModal?.id === 'add-torrents' &&
              UIStore.activeModal?.tab === 'by-file' &&
              UIStore.activeModal?.files) ||
            []
          }
          onFilesChanged={(files) => {
            filesRef.current = files;
          }}
        />
      </FormRow>
      <FormRow>
        <TagSelect
          label={i18n._('torrents.add.tags')}
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
        label={i18n._('torrents.add.destination.label')}
        ref={textboxRef}
        selectable="directories"
        showBasePathToggle
        showCompletedToggle
        showSequentialToggle
      />
      <AddTorrentsActions
        onAddTorrentsClick={() => {
          if (formRef.current == null) {
            return;
          }

          const formData = formRef.current?.getFormData();
          setIsAddingTorrents(true);

          const {destination, start, tags, isBasePath, isCompleted, isSequential} =
            formData as Partial<AddTorrentsByFileFormData>;

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
            isSequential,
            start,
          }).then(() => {
            UIStore.setActiveModal(null);
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
