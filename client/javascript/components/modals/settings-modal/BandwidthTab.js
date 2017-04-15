import {FormattedMessage} from 'react-intl';
import React from 'react';

import SettingsTab from './SettingsTab';

const METHODS_TO_BIND = ['handleDownloadTextChange', 'handleUploadTextChange'];

export default class BandwidthTab extends SettingsTab {
  constructor() {
    super();

    this.state = {
      downloadValue: null,
      uploadValue: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  arrayToString(array) {
    return array.join(', ');
  }

  getTextboxValue(input = []) {
    if (Array.isArray(input)) {
      return this.arrayToString(input);
    }

    return input;
  }

  handleDownloadTextChange(event) {
    this.setState({
      downloadValue: event.target.value
    });

    this.props.onSettingsChange({
      speedLimits: {
        download: this.processSpeedsForSave(event.target.value),
        upload: this.processSpeedsForSave(this.getUploadValue())
      }
    });
  }

  handleUploadTextChange(event) {
    this.setState({
      uploadValue: event.target.value
    });

    this.props.onSettingsChange({
      speedLimits: {
        download: this.processSpeedsForSave(this.getDownloadValue()),
        upload: this.processSpeedsForSave(event.target.value)
      }
    });
  }

  getDownloadValue() {
    let displayedValue = this.state.downloadValue;

    if (displayedValue == null && this.props.settings.speedLimits != null) {
      displayedValue = this.processSpeedsForDisplay(this.props.settings.speedLimits.download);
    }

    return displayedValue;
  }

  getUploadValue() {
    let displayedValue = this.state.uploadValue;

    if (displayedValue == null && this.props.settings.speedLimits != null) {
      displayedValue = this.processSpeedsForDisplay(this.props.settings.speedLimits.upload);
    }

    return displayedValue;
  }

  processSpeedsForDisplay(speeds = []) {
    if (!speeds || speeds.length === 0) {
      return;
    }

    return this.arrayToString(speeds.map((speed) => {
      return Number(speed) / 1024;
    }));
  }

  processSpeedsForSave(speeds = '') {
    if (speeds === '') {
      return [];
    }

    return this.stringToArray(speeds).map((speed) => {
      return Number(speed) * 1024;
    });
  }

  stringToArray(string = '') {
    return string.replace(/\s/g, '').split(',');
  }

  render() {
    let downloadValue = this.getDownloadValue() || 0;
    let uploadValue = this.getUploadValue() || 0;

    return (
      <div className="form">
        <div className="form__section">
          <p className="form__section__heading">
            <FormattedMessage
              id="settings.bandwidth.transferrate.heading"
              defaultMessage="Transfer Rate Throttles"
            />
          </p>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="settings.bandwidth.transferrate.dropdown.preset.download.label"
                  defaultMessage="Dropdown Presets: Download"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleDownloadTextChange}
                value={downloadValue} />
            </div>
          </div>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="settings.bandwidth.transferrate.dropdown.preset.upload.label"
                  defaultMessage="Dropdown Presets: Upload"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleUploadTextChange}
                value={uploadValue} />
            </div>
          </div>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="settings.bandwidth.transferrate.global.throttle.download"
                  defaultMessage="Global Download Rate Throttle"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleGlobalDownMax')}
                value={this.getFieldValue('throttleGlobalDownMax')} />
            </div>
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="settings.bandwidth.transferrate.global.throttle.upload"
                  defaultMessage="Global Upload Rate Throttle"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleGlobalUpMax')}
                value={this.getFieldValue('throttleGlobalUpMax')} />
            </div>
          </div>
        </div>
        <div className="form__section">
          <div className="form__section__heading">
            <FormattedMessage
              id="settings.bandwidth.slots.heading"
              defaultMessage="Slot Availability"
            />
          </div>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="settings.bandwidth.slots.upload.label"
                  defaultMessage="Upload Slots Per Torrent"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMaxUploads')}
                value={this.getFieldValue('throttleMaxUploads')} />
            </div>
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="settings.bandwidth.slots.upload.divider.label"
                  defaultMessage="Upload Slots Divider"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMaxUploadsDiv')}
                value={this.getFieldValue('throttleMaxUploadsDiv')} />
            </div>
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="settings.bandwidth.slots.upload.global.label"
                  defaultMessage="Upload Slots Global"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMaxUploadsGlobal')}
                value={this.getFieldValue('throttleMaxUploadsGlobal')} />
            </div>
          </div>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="settings.bandwidth.slots.download.label"
                  defaultMessage="Download Slots Per Torrent"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMaxDownloads')}
                value={this.getFieldValue('throttleMaxDownloads')} />
            </div>
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="settings.bandwidth.slots.download.divider.label"
                  defaultMessage="Download Slots Divider"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMaxDownloadsDiv')}
                value={this.getFieldValue('throttleMaxDownloadsDiv')} />
            </div>
            <div className="form__column">
              <label className="form__label">
                <FormattedMessage
                  id="settings.bandwidth.slots.download.global.label"
                  defaultMessage="Download Slots Global"
                />
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMaxDownloadsGlobal')}
                value={this.getFieldValue('throttleMaxDownloadsGlobal')} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
