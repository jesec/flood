import {FC, useState} from 'react';
import {Trans} from '@lingui/react';

import {Checkbox, Form, FormRow, Textbox} from '@client/ui';
import SettingStore from '@client/stores/SettingStore';

import {ClientSettings} from '@shared/types/ClientSettings';
import type {FloodSettings} from '@shared/types/FloodSettings';

import {getChangedClientSetting, handleClientSettingChange} from './SettingsUtils';
import ModalFormSectionHeader from '../ModalFormSectionHeader';

interface ResourcesTabProps {
  onClientSettingsChange: (changeSettings: Partial<ClientSettings>) => void;
  onSettingsChange: (changeSettings: Partial<FloodSettings>) => void;
}

const ResourcesTab: FC<ResourcesTabProps> = ({onClientSettingsChange, onSettingsChange}: ResourcesTabProps) => {
  const [changedClientSettings, setChangedClientSettings] = useState<Partial<ClientSettings>>({});

  return (
    <Form
      onChange={({event}) => {
        const inputElement = event.target as HTMLInputElement;

        if (inputElement.name === 'autoTags') {
          onSettingsChange({
            autoTags: [
              ...new Set(
                inputElement.value
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0),
              ),
            ],
          });
          return;
        }

        if (inputElement.name === 'autoTagWithUsername') {
          onSettingsChange({autoTagWithUsername: inputElement.checked});
          return;
        }

        const newChangedClientSettings = {
          ...changedClientSettings,
          ...handleClientSettingChange(event),
        };

        setChangedClientSettings(newChangedClientSettings);
        onClientSettingsChange(newChangedClientSettings);
      }}
    >
      <ModalFormSectionHeader>
        <Trans id="settings.resources.disk.heading" />
      </ModalFormSectionHeader>
      <FormRow>
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'directoryDefault')}
          id="directoryDefault"
          label={<Trans id="settings.resources.disk.download.location.label" />}
        />
      </FormRow>
      <FormRow>
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'networkMaxOpenFiles')}
          id="networkMaxOpenFiles"
          label={<Trans id="settings.resources.max.open.files" />}
          width="one-half"
        />
        <Checkbox
          defaultChecked={getChangedClientSetting(changedClientSettings, 'piecesHashOnCompletion')}
          grow={false}
          id="piecesHashOnCompletion"
          labelOffset
          matchTextboxHeight
        >
          <Trans id="settings.resources.disk.check.hash.label" />
        </Checkbox>
      </FormRow>
      <ModalFormSectionHeader>
        <Trans id="settings.resources.memory.heading" />
      </ModalFormSectionHeader>
      <FormRow>
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'piecesMemoryMax')}
          id="piecesMemoryMax"
          label={
            <div>
              <Trans id="settings.resources.memory.max.label" /> <em className="unit">(MB)</em>
            </div>
          }
          width="one-half"
        />
      </FormRow>
      <ModalFormSectionHeader>
        <Trans id="settings.resources.auto.tags.heading" />
      </ModalFormSectionHeader>
      <FormRow>
        <Textbox
          defaultValue={SettingStore.floodSettings.autoTags?.join(', ')}
          id="autoTags"
          label={<Trans id="settings.resources.auto.tags.label" />}
          placeholder="tag1, tag2"
        />
        <Checkbox
          defaultChecked={SettingStore.floodSettings.autoTagWithUsername}
          grow={false}
          id="autoTagWithUsername"
          labelOffset
          matchTextboxHeight
        >
          <Trans id="settings.resources.auto.tags.username.label" />
        </Checkbox>
      </FormRow>
    </Form>
  );
};

export default ResourcesTab;
