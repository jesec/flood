import React from 'react';

const METHODS_TO_BIND = ['handleDownloadTextChange', 'handleUploadTextChange'];

export default class AddTorrents extends React.Component {
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
        download: this.processSpeedsForSave(event.target.value)
      }
    });
  }

  handleUploadTextChange(event) {
    this.setState({
      uploadValue: event.target.value
    });

    this.props.onSettingsChange({
      speedLimits: {
        upload: this.processSpeedsForSave(event.target.value)
      }
    });
  }

  getDownloadValue() {
    let displayedValue = this.state.downloadValue;

    if (displayedValue == null) {
      displayedValue = this.processSpeedsForDisplay(this.props.settings.speedLimits.download);
    }

    return displayedValue;
  }

  getUploadValue() {
    let displayedValue = this.state.uploadValue;

    if (displayedValue == null) {
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
    let downloadValue = this.getDownloadValue();
    let uploadValue = this.getUploadValue();

    return (
      <div>
        <p className="modal__tab__introduction">
          Provide a comma-separated list of speed values (in kilobytes per second). 0 represents unlimited.
        </p>
        <div className="form">
          <div className="form__row">
            <label className="form__label">
              Download Presets
            </label>
            <input className="textbox" type="text"
              onChange={this.handleDownloadTextChange}
              value={downloadValue} />
          </div>
          <div className="form__row">
            <label className="form__label">
              Upload Presets
            </label>
            <input className="textbox" type="text"
              onChange={this.handleUploadTextChange}
              value={uploadValue} />
          </div>
        </div>
      </div>
    );
  }
}
