import React from 'react';

const METHODS_TO_BIND = ['handleClientSettingFieldChange'];

export default class SettingsTab extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getFieldValue(fieldName) {
    if (this.state[fieldName] == null) {
      return this.props.settings[fieldName] || '';
    }

    return this.state[fieldName];
  }

  handleClientSettingFieldChange(fieldName, event) {
    let newState = {[fieldName]: event.target.value};

    this.setState(newState);
    this.props.onClientSettingsChange(newState);
  }

  handleClientSettingCheckboxChange(fieldName, value) {
    let checkedValue = value ? '1' : '0';
    let newState = {[fieldName]: checkedValue};

    this.setState(newState);
    this.props.onClientSettingsChange(newState);
  }
}
