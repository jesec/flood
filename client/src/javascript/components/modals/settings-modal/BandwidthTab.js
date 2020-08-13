import {FormattedMessage} from 'react-intl';
import React from 'react';

import {Form, FormRow, Textbox} from '../../../ui';
import ModalFormSectionHeader from '../ModalFormSectionHeader';
import SettingsTab from './SettingsTab';

export default class BandwidthTab extends SettingsTab {
  state = {};

  handleFormChange = ({event, formData}) => {
    if (event.target.name === 'dropdownPresetDownload' || event.target.name === 'dropdownPresetUpload') {
      this.props.onSettingsChange({
        speedLimits: {
          download: this.processSpeedsForSave(formData.dropdownPresetDownload),
          upload: this.processSpeedsForSave(formData.dropdownPresetUpload),
        },
      });

      return;
    }

    this.handleClientSettingFieldChange(event.target.name, event);
  };

  getDownloadValue() {
    if (this.props.settings.speedLimits != null) {
      return this.processSpeedsForDisplay(this.props.settings.speedLimits.download);
    }

    return 0;
  }

  getUploadValue() {
    if (this.props.settings.speedLimits != null) {
      return this.processSpeedsForDisplay(this.props.settings.speedLimits.upload);
    }

    return 0;
  }

  processSpeedsForDisplay(speeds = []) {
    if (!speeds || speeds.length === 0) {
      return;
    }

    return speeds.map((speed) => Number(speed) / 1024).join(', ');
  }

  processSpeedsForSave(speeds = '') {
    if (speeds === '') {
      return [];
    }

    return speeds
      .replace(/\s/g, '')
      .split(',')
      .map((speed) => Number(speed) * 1024);
  }

  render() {
    return (
      <Form onChange={this.handleFormChange}>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.bandwidth.transferrate.heading" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getDownloadValue()}
            label={<FormattedMessage id="settings.bandwidth.transferrate.dropdown.preset.download.label" />}
            id="dropdownPresetDownload"
          />
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getUploadValue()}
            label={<FormattedMessage id="settings.bandwidth.transferrate.dropdown.preset.upload.label" />}
            id="dropdownPresetUpload"
          />
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('throttleGlobalDownMax')}
            label={<FormattedMessage id="settings.bandwidth.transferrate.global.throttle.download" />}
            id="throttleGlobalDownMax"
          />
          <Textbox
            defaultValue={this.getFieldValue('throttleGlobalUpMax')}
            label={<FormattedMessage id="settings.bandwidth.transferrate.global.throttle.upload" />}
            id="throttleGlobalUpMax"
          />
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.bandwidth.slots.heading" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('throttleMaxUploads')}
            label={<FormattedMessage id="settings.bandwidth.slots.upload.label" />}
            id="throttleMaxUploads"
          />
          <Textbox
            defaultValue={this.getFieldValue('throttleMaxUploadsDiv')}
            label={<FormattedMessage id="settings.bandwidth.slots.upload.divider.label" />}
            id="throttleMaxUploadsDiv"
          />
          <Textbox
            defaultValue={this.getFieldValue('throttleMaxUploadsGlobal')}
            label={<FormattedMessage id="settings.bandwidth.slots.upload.global.label" />}
            id="throttleMaxUploadsGlobal"
          />
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('throttleMaxDownloads')}
            label={<FormattedMessage id="settings.bandwidth.slots.download.label" />}
            id="throttleMaxDownloads"
          />
          <Textbox
            defaultValue={this.getFieldValue('throttleMaxDownloadsDiv')}
            label={<FormattedMessage id="settings.bandwidth.slots.download.divider.label" />}
            id="throttleMaxDownloadsDiv"
          />
          <Textbox
            defaultValue={this.getFieldValue('throttleMaxDownloadsGlobal')}
            label={<FormattedMessage id="settings.bandwidth.slots.download.global.label" />}
            id="throttleMaxDownloadsGlobal"
          />
        </FormRow>
      </Form>
    );
  }
}
