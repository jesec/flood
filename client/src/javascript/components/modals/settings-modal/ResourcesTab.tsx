import {FC, useState} from 'react';
import {Trans} from '@lingui/react';

import {Checkbox, Form, FormRow, Textbox} from '@client/ui';

import {ClientSettings} from '@shared/types/ClientSettings';

import {getChangedClientSetting, handleClientSettingChange} from './SettingsUtils';
import ModalFormSectionHeader from '../ModalFormSectionHeader';

interface ResourcesTabProps {
  onClientSettingsChange: (changeSettings: Partial<ClientSettings>) => void;
}

const ResourcesTab: FC<ResourcesTabProps> = ({onClientSettingsChange}: ResourcesTabProps) => {
  const [changedClientSettings, setChangedClientSettings] = useState<Partial<ClientSettings>>({});

  return (
    <Form
      onChange={({event}) => {
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
    </Form>
  );
};

export default ResourcesTab;
