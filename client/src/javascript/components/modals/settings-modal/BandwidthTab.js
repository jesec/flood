import {Form, FormRow, Textbox} from 'flood-ui-kit';
import {FormattedMessage} from 'react-intl';
import React from 'react';

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

    return speeds.map(speed => Number(speed) / 1024).join(', ');
  }

  processSpeedsForSave(speeds = '') {
    if (speeds === '') {
      return [];
    }

    return speeds
      .replace(/\s/g, '')
      .split(',')
      .map(speed => Number(speed) * 1024);
  }

  render() {
    return (
      <Form onChange={this.handleFormChange}>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.bandwidth.transferrate.heading" defaultMessage="Transfer Rate Throttles" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getDownloadValue()}
            label={
              <FormattedMessage
                id="settings.bandwidth.transferrate.dropdown.preset.download.label"
                defaultMessage="Dropdown Presets: Download"
              />
            }
            id="dropdownPresetDownload"
          />
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getUploadValue()}
            label={
              <FormattedMessage
                id="settings.bandwidth.transferrate.dropdown.preset.upload.label"
                defaultMessage="Dropdown Presets: Upload"
              />
            }
            id="dropdownPresetUpload"
          />
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('throttleGlobalDownMax')}
            label={
              <FormattedMessage
                id="settings.bandwidth.transferrate.global.throttle.download"
                defaultMessage="Global Download Rate Throttle"
              />
            }
            id="throttleGlobalDownMax"
          />
          <Textbox
            defaultValue={this.getFieldValue('throttleGlobalUpMax')}
            label={
              <FormattedMessage
                id="settings.bandwidth.transferrate.global.throttle.upload"
                defaultMessage="Global Upload Rate Throttle"
              />
            }
            id="throttleGlobalUpMax"
          />
        </FormRow>
        <ModalFormSectionHeader>
          <FormattedMessage id="settings.bandwidth.slots.heading" defaultMessage="Slot Availability" />
        </ModalFormSectionHeader>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('throttleMaxUploads')}
            label={
              <FormattedMessage id="settings.bandwidth.slots.upload.label" defaultMessage="Upload Slots Per Torrent" />
            }
            id="throttleMaxUploads"
          />
          <Textbox
            defaultValue={this.getFieldValue('throttleMaxUploadsDiv')}
            label={
              <FormattedMessage
                id="settings.bandwidth.slots.upload.divider.label"
                defaultMessage="Upload Slots Divider"
              />
            }
            id="throttleMaxUploadsDiv"
          />
          <Textbox
            defaultValue={this.getFieldValue('throttleMaxUploadsGlobal')}
            label={
              <FormattedMessage
                id="settings.bandwidth.slots.upload.global.label"
                defaultMessage="Upload Slots Global"
              />
            }
            id="throttleMaxUploadsGlobal"
          />
        </FormRow>
        <FormRow>
          <Textbox
            defaultValue={this.getFieldValue('throttleMaxDownloads')}
            label={
              <FormattedMessage
                id="settings.bandwidth.slots.download.label"
                defaultMessage="Download Slots Per Torrent"
              />
            }
            id="throttleMaxDownloads"
          />
          <Textbox
            defaultValue={this.getFieldValue('throttleMaxDownloadsDiv')}
            label={
              <FormattedMessage
                id="settings.bandwidth.slots.download.divider.label"
                defaultMessage="Download Slots Divider"
              />
            }
            id="throttleMaxDownloadsDiv"
          />
          <Textbox
            defaultValue={this.getFieldValue('throttleMaxDownloadsGlobal')}
            label={
              <FormattedMessage
                id="settings.bandwidth.slots.download.global.label"
                defaultMessage="Download Slots Global"
              />
            }
            id="throttleMaxDownloadsGlobal"
          />
        </FormRow>
      </Form>
    );
  }
}
