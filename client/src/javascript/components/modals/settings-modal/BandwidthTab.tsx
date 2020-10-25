import {FormattedMessage} from 'react-intl';
import React from 'react';

import {Form, FormRow, Textbox} from '../../../ui';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import SettingStore from '../../../stores/SettingStore';
import SettingsTab from './SettingsTab';

const processSpeedsForDisplay = (speeds: number[]) => {
  if (!speeds || speeds.length === 0) {
    return undefined;
  }

  return speeds.map((speed) => Number(speed) / 1024).join(', ');
};

const processSpeedsForSave = (speeds = '') => {
  if (speeds === '') {
    return [];
  }

  return speeds
    .replace(/\s/g, '')
    .split(',')
    .map((speed) => Number(speed) * 1024);
};

export default class BandwidthTab extends SettingsTab {
  handleFormChange = ({
    event,
    formData,
  }: {
    event: Event | React.FormEvent<HTMLFormElement>;
    formData: Record<string, unknown>;
  }) => {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.name === 'dropdownPresetDownload' || inputElement.name === 'dropdownPresetUpload') {
      this.props.onSettingsChange({
        speedLimits: {
          download: processSpeedsForSave(formData.dropdownPresetDownload as string),
          upload: processSpeedsForSave(formData.dropdownPresetUpload as string),
        },
      });

      return;
    }

    this.handleClientSettingChange(event);
  };

  render() {
    return (
      <Form onChange={this.handleFormChange}>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.bandwidth.transferrate.heading" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={
              SettingStore.floodSettings.speedLimits != null
                ? processSpeedsForDisplay(SettingStore.floodSettings.speedLimits.download)
                : 0
            }
            label={<FormattedMessage id="settings.bandwidth.transferrate.dropdown.preset.download.label" />}
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
            label={<FormattedMessage id="settings.bandwidth.transferrate.dropdown.preset.upload.label" />}
            id="dropdownPresetUpload"
          />
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getChangedClientSetting('throttleGlobalDownMax')}
            label={<FormattedMessage id="settings.bandwidth.transferrate.global.throttle.download" />}
            id="throttleGlobalDownMax"
          />
          <Textbox
            defaultValue={this.getChangedClientSetting('throttleGlobalUpMax')}
            label={<FormattedMessage id="settings.bandwidth.transferrate.global.throttle.upload" />}
            id="throttleGlobalUpMax"
          />
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.bandwidth.slots.heading" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getChangedClientSetting('throttleMaxUploads')}
            label={<FormattedMessage id="settings.bandwidth.slots.upload.label" />}
            id="throttleMaxUploads"
          />
          <Textbox
            defaultValue={this.getChangedClientSetting('throttleMaxUploadsDiv')}
            label={<FormattedMessage id="settings.bandwidth.slots.upload.divider.label" />}
            id="throttleMaxUploadsDiv"
          />
          <Textbox
            defaultValue={this.getChangedClientSetting('throttleMaxUploadsGlobal')}
            label={<FormattedMessage id="settings.bandwidth.slots.upload.global.label" />}
            id="throttleMaxUploadsGlobal"
          />
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getChangedClientSetting('throttleMaxDownloads')}
            label={<FormattedMessage id="settings.bandwidth.slots.download.label" />}
            id="throttleMaxDownloads"
          />
          <Textbox
            defaultValue={this.getChangedClientSetting('throttleMaxDownloadsDiv')}
            label={<FormattedMessage id="settings.bandwidth.slots.download.divider.label" />}
            id="throttleMaxDownloadsDiv"
          />
          <Textbox
            defaultValue={this.getChangedClientSetting('throttleMaxDownloadsGlobal')}
            label={<FormattedMessage id="settings.bandwidth.slots.download.global.label" />}
            id="throttleMaxDownloadsGlobal"
          />
        </FormRow>
      </Form>
    );
  }
}
