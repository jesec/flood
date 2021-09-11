import {FC, FormEvent, useState} from 'react';
import {Trans} from '@lingui/react';

import {Form, FormRow, Textbox} from '@client/ui';
import SettingStore from '@client/stores/SettingStore';

import {FloodSettings} from '@shared/types/FloodSettings';
import {ClientSettings} from '@shared/types/ClientSettings';

import {getChangedClientSetting, handleClientSettingChange} from './SettingsUtils';
import ModalFormSectionHeader from '../ModalFormSectionHeader';

const processSpeedsForDisplay = (speeds: number[]): string | undefined => {
  if (!speeds || speeds.length === 0) {
    return undefined;
  }

  return speeds.join(', ');
};

const processSpeedsForSave = (speeds = ''): number[] => {
  if (speeds === '') {
    return [];
  }

  return speeds
    .replace(/\s/g, '')
    .split(',')
    .map((speed) => Number(speed));
};

interface BandwidthTabProps {
  onSettingsChange: (changeSettings: Partial<FloodSettings>) => void;
  onClientSettingsChange: (changeSettings: Partial<ClientSettings>) => void;
}

const BandwidthTab: FC<BandwidthTabProps> = ({onSettingsChange, onClientSettingsChange}: BandwidthTabProps) => {
  const [changedClientSettings, setChangedClientSettings] = useState<Partial<ClientSettings>>({});

  return (
    <Form
      onChange={({event, formData}: {event: Event | FormEvent<HTMLFormElement>; formData: Record<string, unknown>}) => {
        const inputElement = event.target as HTMLInputElement;

        if (inputElement.name === 'dropdownPresetDownload' || inputElement.name === 'dropdownPresetUpload') {
          onSettingsChange({
            speedLimits: {
              download: processSpeedsForSave(formData.dropdownPresetDownload as string),
              upload: processSpeedsForSave(formData.dropdownPresetUpload as string),
            },
          });

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
        <Trans id="settings.bandwidth.transferrate.heading" />
      </ModalFormSectionHeader>
      <FormRow>
        <Textbox
          defaultValue={
            SettingStore.floodSettings.speedLimits != null
              ? processSpeedsForDisplay(SettingStore.floodSettings.speedLimits.download)
              : 0
          }
          label={<Trans id="settings.bandwidth.transferrate.dropdown.preset.download.label" />}
          id="dropdownPresetDownload"
        />
      </FormRow>
      <FormRow>
        <Textbox
          defaultValue={
            SettingStore.floodSettings.speedLimits != null
              ? processSpeedsForDisplay(SettingStore.floodSettings.speedLimits.upload)
              : 0
          }
          label={<Trans id="settings.bandwidth.transferrate.dropdown.preset.upload.label" />}
          id="dropdownPresetUpload"
        />
      </FormRow>
      <FormRow>
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'throttleGlobalDownSpeed')}
          label={<Trans id="settings.bandwidth.transferrate.global.throttle.download" />}
          id="throttleGlobalDownSpeed"
        />
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'throttleGlobalUpSpeed')}
          label={<Trans id="settings.bandwidth.transferrate.global.throttle.upload" />}
          id="throttleGlobalUpSpeed"
        />
      </FormRow>
      <ModalFormSectionHeader>
        <Trans id="settings.bandwidth.slots.heading" />
      </ModalFormSectionHeader>
      <FormRow>
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'throttleMaxUploads')}
          label={<Trans id="settings.bandwidth.slots.upload.label" />}
          id="throttleMaxUploads"
        />
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'throttleMaxUploadsGlobal')}
          label={<Trans id="settings.bandwidth.slots.upload.global.label" />}
          id="throttleMaxUploadsGlobal"
        />
      </FormRow>
      <FormRow>
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'throttleMaxDownloads')}
          label={<Trans id="settings.bandwidth.slots.download.label" />}
          id="throttleMaxDownloads"
        />
        <Textbox
          defaultValue={getChangedClientSetting(changedClientSettings, 'throttleMaxDownloadsGlobal')}
          label={<Trans id="settings.bandwidth.slots.download.global.label" />}
          id="throttleMaxDownloadsGlobal"
        />
      </FormRow>
    </Form>
  );
};

export default BandwidthTab;
