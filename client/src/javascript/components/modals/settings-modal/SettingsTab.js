import React from 'react';

export default class SettingsTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getFieldValue(fieldName) {
    if (this.state[fieldName] == null) {
      return this.props.settings[fieldName] || '';
    }

    return this.state[fieldName];
  }

  handleClientSettingFieldChange(fieldName, event) {
    let {value} = event.target;

    if (event.target.type === 'checkbox') {
      value = event.target.checked ? '1' : '0';
    }

    const nextState = {[fieldName]: value};

    this.setState(nextState);
    this.props.onClientSettingsChange(nextState);
  }
}
