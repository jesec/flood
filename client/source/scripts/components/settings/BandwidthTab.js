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
            Speed Limit Dropdown Presets
          </p>
          <p className="form__section__sub-heading">
            Enter a comma-separated list of speeds in kB. 0 represents unlimited.
          </p>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                Download Presets
              </label>
              <input className="textbox" type="text"
                onChange={this.handleDownloadTextChange}
                value={downloadValue} />
            </div>
            <div className="form__column">
              <label className="form__label">
                Upload Presets
              </label>
              <input className="textbox" type="text"
                onChange={this.handleUploadTextChange}
                value={uploadValue} />
            </div>
          </div>
        </div>
        <div className="form__section">
          <div className="form__section__heading">
            Slot Availability
          </div>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                Upload Slots Per Torrent
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMaxUploads')}
                value={this.getFieldValue('throttleMaxUploads')} />
            </div>
            <div className="form__column">
              <label className="form__label">
                Upload Slots Divider
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMaxUploadsDiv')}
                value={this.getFieldValue('throttleMaxUploadsDiv')} />
            </div>
            <div className="form__column">
              <label className="form__label">
                Upload Slots Global
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMaxUploadsGlobal')}
                value={this.getFieldValue('throttleMaxUploadsGlobal')} />
            </div>
          </div>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                Download Slots Per Torrent
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMaxDownloads')}
                value={this.getFieldValue('throttleMaxDownloads')} />
            </div>
            <div className="form__column">
              <label className="form__label">
                Download Slots Divider
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingFieldChange.bind(this, 'throttleMaxDownloadsDiv')}
                value={this.getFieldValue('throttleMaxDownloadsDiv')} />
            </div>
            <div className="form__column">
              <label className="form__label">
                Download Slots Global
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
