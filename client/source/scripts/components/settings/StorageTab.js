import _ from 'lodash';
import React from 'react';

import Checkbox from '../forms/Checkbox';
import SettingsTab from './SettingsTab';

export default class StorageTab extends SettingsTab {
  constructor() {
    super(...arguments);

    this.state = {};
  }

  render() {
    return (
      <div className="form">
        <div className="form__section">
          <div className="form__section__heading">
            Directories
          </div>
          <div className="form__row">
            <div className="form__column">
              <label className="form__label">
                Default Download Directory
              </label>
              <input className="textbox" type="text"
                onChange={this.handleClientSettingCheckboxChange.bind(this, 'directoryDefault')}
                value={this.getFieldValue('directoryDefault')} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
